const { defaultSpeakers } = require('../data/default-speakers')

class SpeakerMemoryRepository {
  constructor() {
    this.nextSpeakerId = 1
    this.nextTalkId = 1
    this.nextEventLinkId = 1
    this.speakers = []
    this.seedDefaults()
  }

  seedDefaults() {
    for (const speaker of defaultSpeakers) {
      const createdSpeaker = this.createSync(speaker)
      for (const talk of speaker.talks) {
        this.addTalkSync(createdSpeaker.id, talk)
      }
      for (const eventLink of speaker.eventLinks) {
        this.addEventLinkSync(createdSpeaker.id, eventLink)
      }
    }
  }

  sanitizeSpeaker(speaker) {
    return {
      id: speaker.id,
      fullName: speaker.fullName,
      slug: speaker.slug,
      initials: speaker.initials,
      institution: speaker.institution,
      country: speaker.country,
      countryCode: speaker.countryCode,
      city: speaker.city,
      bio: speaker.bio,
      expertise: speaker.expertise,
      featured: speaker.featured,
      createdAt: speaker.createdAt,
      updatedAt: speaker.updatedAt,
      talks: speaker.talks || [],
      eventLinks: speaker.eventLinks || []
    }
  }

  async list(filters = {}) {
    let result = [...this.speakers]

    if (filters.country) {
      result = result.filter((speaker) => speaker.country.toLowerCase() === filters.country.toLowerCase())
    }

    if (filters.institution) {
      result = result.filter((speaker) => speaker.institution.toLowerCase().includes(filters.institution.toLowerCase()))
    }

    if (filters.featured !== undefined) {
      const featured = String(filters.featured).toLowerCase() === 'true'
      result = result.filter((speaker) => speaker.featured === featured)
    }

    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter((speaker) =>
        speaker.fullName.toLowerCase().includes(query) ||
        speaker.bio.toLowerCase().includes(query) ||
        speaker.expertise.some((item) => item.toLowerCase().includes(query))
      )
    }

    return result.map((speaker) => this.sanitizeSpeaker(speaker))
  }

  async findById(id) {
    const speaker = this.speakers.find((currentSpeaker) => currentSpeaker.id === Number(id)) || null
    return speaker ? this.sanitizeSpeaker(speaker) : null
  }

  createSync(data) {
    const timestamp = new Date().toISOString()
    const speaker = {
      id: this.nextSpeakerId++,
      fullName: data.fullName,
      slug: data.slug,
      initials: data.initials,
      institution: data.institution,
      country: data.country,
      countryCode: data.countryCode,
      city: data.city,
      bio: data.bio,
      expertise: data.expertise || [],
      featured: Boolean(data.featured),
      createdAt: timestamp,
      updatedAt: timestamp,
      talks: [],
      eventLinks: []
    }

    this.speakers.push(speaker)
    return speaker
  }

  async create(data) {
    return this.sanitizeSpeaker(this.createSync(data))
  }

  async update(id, data) {
    const speaker = this.speakers.find((currentSpeaker) => currentSpeaker.id === Number(id))
    if (!speaker) {
      return null
    }

    Object.assign(speaker, {
      fullName: data.fullName ?? speaker.fullName,
      slug: data.slug ?? speaker.slug,
      initials: data.initials ?? speaker.initials,
      institution: data.institution ?? speaker.institution,
      country: data.country ?? speaker.country,
      countryCode: data.countryCode ?? speaker.countryCode,
      city: data.city ?? speaker.city,
      bio: data.bio ?? speaker.bio,
      expertise: data.expertise ?? speaker.expertise,
      featured: data.featured ?? speaker.featured,
      updatedAt: new Date().toISOString()
    })

    return this.sanitizeSpeaker(speaker)
  }

  async remove(id) {
    const index = this.speakers.findIndex((speaker) => speaker.id === Number(id))
    if (index === -1) {
      return null
    }

    const [removed] = this.speakers.splice(index, 1)
    return this.sanitizeSpeaker(removed)
  }

  async listCountries() {
    return [...new Set(this.speakers.map((speaker) => speaker.country))].sort()
  }

  addTalkSync(speakerId, talk) {
    const speaker = this.speakers.find((currentSpeaker) => currentSpeaker.id === Number(speakerId))
    if (!speaker) {
      return null
    }

    const talkRecord = {
      id: this.nextTalkId++,
      title: talk.title,
      abstract: talk.abstract,
      topic: talk.topic,
      durationMinutes: talk.durationMinutes
    }

    speaker.talks.push(talkRecord)
    speaker.updatedAt = new Date().toISOString()
    return talkRecord
  }

  async addTalk(speakerId, talk) {
    return this.addTalkSync(speakerId, talk)
  }

  addEventLinkSync(speakerId, eventLink) {
    const speaker = this.speakers.find((currentSpeaker) => currentSpeaker.id === Number(speakerId))
    if (!speaker) {
      return null
    }

    const eventRecord = {
      id: this.nextEventLinkId++,
      conferenceId: eventLink.conferenceId,
      conferenceTitle: eventLink.conferenceTitle,
      participationType: eventLink.participationType,
      scheduledAt: eventLink.scheduledAt
    }

    speaker.eventLinks.push(eventRecord)
    speaker.updatedAt = new Date().toISOString()
    return eventRecord
  }

  async addEventLink(speakerId, eventLink) {
    return this.addEventLinkSync(speakerId, eventLink)
  }

  async listTalks(speakerId) {
    const speaker = this.speakers.find((currentSpeaker) => currentSpeaker.id === Number(speakerId))
    return speaker ? [...speaker.talks] : null
  }

  async listEventLinks(speakerId) {
    const speaker = this.speakers.find((currentSpeaker) => currentSpeaker.id === Number(speakerId))
    return speaker ? [...speaker.eventLinks] : null
  }
}

module.exports = {
  SpeakerMemoryRepository
}
