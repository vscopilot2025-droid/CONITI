const { Router } = require('express')
const Stripe = require('stripe')
const crypto = require('crypto')
const { requireAuth } = require('../middleware/auth.middleware')

const ticketCatalog = {
  Visitante: { amountInMinorUnit: 180000, currency: 'cop' },
  Ponente: { amountInMinorUnit: 320000, currency: 'cop' },
  Estudiante: { amountInMinorUnit: 90000, currency: 'cop' }
}

function buildSuccessUrl(baseUrl, sessionId) {
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}session_id=${encodeURIComponent(sessionId)}`
}

function createPaymentsRouter(repository, config) {
  const router = Router()
  const authGuard = requireAuth(repository)

  router.get('/sessions/:sessionId', authGuard, async (req, res) => {
    if (typeof repository.findPaymentSessionById !== 'function') {
      return res.status(404).json({
        ok: false,
        message: 'Consulta de pagos no disponible en este almacenamiento.'
      })
    }

    const session = await repository.findPaymentSessionById(req.params.sessionId)
    if (!session) {
      return res.status(404).json({
        ok: false,
        message: 'Sesión de pago no encontrada.'
      })
    }

    if (String(session.userId) !== String(req.auth.user.id) && req.auth.user.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para consultar esta sesión de pago.'
      })
    }

    return res.status(200).json({
      ok: true,
      payment: session
    })
  })

  router.post('/create-checkout-session', authGuard, async (req, res) => {
    const isMockMode = config.payments.mode === 'mock'

    if (!isMockMode && !config.payments.stripeSecretKey) {
      return res.status(503).json({
        ok: false,
        message: 'Pagos no configurados. Define AUTH_SERVICE_STRIPE_SECRET_KEY o usa AUTH_SERVICE_PAYMENTS_MODE=mock.'
      })
    }

    const { ticketType, description } = req.body || {}

    if (!ticketType?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El tipo de boleta es obligatorio.'
      })
    }

    const normalizedTicketType = ticketType.trim()
    const ticketConfig = ticketCatalog[normalizedTicketType]

    if (!ticketConfig) {
      return res.status(400).json({
        ok: false,
        message: 'Tipo de boleta no válido.'
      })
    }

    const normalizedAmount = ticketConfig.amountInMinorUnit
    const normalizedCurrency = (ticketConfig.currency || config.payments.currency || 'cop').toLowerCase()

    if (isMockMode) {
      const sessionId = `mock_cs_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
      const successUrl = buildSuccessUrl(config.payments.successUrl, sessionId)

      if (typeof repository.createPaymentSession === 'function') {
        await repository.createPaymentSession({
          sessionId,
          userId: req.auth.user.id,
          userEmail: req.auth.user.email,
          ticketType: normalizedTicketType,
          amountInMinorUnit: normalizedAmount,
          currency: normalizedCurrency,
          checkoutUrl: successUrl,
          status: 'paid'
        })
      }

      if (typeof repository.markPaymentCompleted === 'function') {
        await repository.markPaymentCompleted({
          sessionId,
          providerPaymentId: `mock_pi_${crypto.randomBytes(6).toString('hex')}`,
          providerEventId: `mock_evt_${crypto.randomBytes(6).toString('hex')}`
        })
      }

      return res.status(201).json({
        ok: true,
        mode: 'mock',
        sessionId,
        url: successUrl
      })
    }

    const stripe = new Stripe(config.payments.stripeSecretKey)
    const idempotencyKey = req.headers['x-idempotency-key']
      ? String(req.headers['x-idempotency-key']).slice(0, 120)
      : undefined

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: buildSuccessUrl(config.payments.successUrl, '{CHECKOUT_SESSION_ID}'),
        cancel_url: config.payments.cancelUrl,
        payment_method_types: ['card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: normalizedCurrency,
              unit_amount: normalizedAmount,
              product_data: {
                name: `Boleta CONIITI - ${normalizedTicketType}`,
                description: description?.trim() || 'Compra de boleta en modo test'
              }
            }
          }
        ],
        metadata: {
          userId: String(req.auth.user.id),
          userEmail: req.auth.user.email,
          ticketType: normalizedTicketType
        },
        customer_email: req.auth.user.email
      }, idempotencyKey ? { idempotencyKey } : undefined)

      if (typeof repository.createPaymentSession === 'function') {
        await repository.createPaymentSession({
          sessionId: session.id,
          userId: req.auth.user.id,
          userEmail: req.auth.user.email,
          ticketType: normalizedTicketType,
          amountInMinorUnit: normalizedAmount,
          currency: normalizedCurrency,
          checkoutUrl: session.url,
          status: 'created'
        })
      }

      return res.status(201).json({
        ok: true,
        sessionId: session.id,
        url: session.url
      })
    } catch (error) {
      console.error('[payments] create-checkout-session error:', error)
      return res.status(500).json({
        ok: false,
        message: 'No se pudo crear la sesión de pago.'
      })
    }
  })

  return router
}

function createPaymentsWebhookHandler(repository, config) {
  return async (req, res) => {
    if (config.payments.mode === 'mock') {
      return res.status(200).json({
        ok: true,
        received: true,
        eventType: 'mock.webhook.ignored'
      })
    }

    if (!config.payments.stripeSecretKey) {
      return res.status(503).json({
        ok: false,
        message: 'Pagos no configurados.'
      })
    }

    const stripe = new Stripe(config.payments.stripeSecretKey)
    const signature = req.headers['stripe-signature']

    try {
      let event = null

      if (config.payments.stripeWebhookSecret) {
        if (!signature) {
          return res.status(400).json({
            ok: false,
            message: 'Falta la firma del webhook.'
          })
        }

        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          config.payments.stripeWebhookSecret
        )
      } else {
        event = JSON.parse(req.body.toString('utf8'))
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object

        if (typeof repository.markPaymentCompleted === 'function') {
          await repository.markPaymentCompleted({
            sessionId: session.id,
            providerPaymentId: session.payment_intent || null,
            providerEventId: event.id
          })
        }

        console.log('[payments] checkout.session.completed', {
          sessionId: session.id,
          customerEmail: session.customer_details?.email || session.customer_email,
          metadata: session.metadata || {}
        })
      }

      if (event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object

        if (typeof repository.markPaymentFailed === 'function') {
          await repository.markPaymentFailed({
            sessionId: session.id,
            providerEventId: event.id
          })
        }
      }

      return res.status(200).json({ ok: true, received: true, eventType: event.type })
    } catch (error) {
      console.error('[payments] webhook error:', error)
      return res.status(400).json({
        ok: false,
        message: `Webhook inválido: ${error.message}`
      })
    }
  }
}

module.exports = {
  createPaymentsRouter,
  createPaymentsWebhookHandler
}
