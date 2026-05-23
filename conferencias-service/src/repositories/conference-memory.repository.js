const { defaultConferences } = require('../data/default-conferences')
const { buildSlug } = require('../utils/slug.util')

class ConferenceMemoryRepository {
  constructor() {
    this.nextConferenceId = 1
    this.nextAgendaId = 1
    this.conferences = []
    this.seedDefaults()
  }

  seedDefaults() {
    for (const conference of defaultConferences) {
      const createdConference = this.createSync(conference)
      for (const agendaItem of conference.agenda) {
        this.addAgendaItemSync(createdConference.id, agendaItem)
      }
    }
  }

  async list(filters = {}) {
    let result = [...this.conferences]

    if (filters.status) {
      result = result.filter((conference) => conference.status === filters.status)
    }

    if (filters.category) {
      result = result.filter((conference) => conference.category.toLowerCase() === filters.category.toLowerCase())
    }

    if (filters.modality) {
      result = result.filter((conference) => conference.modality === filters.modality)
    }

    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter((conference) =>
        conference.title.toLowerCase().includes(query) ||
        conference.description.toLowerCase().includes(query) ||
        conference.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    if (filters.fromDate) {
      result = result.filter((conference) => conference.startDate >= filters.fromDate)
    }

    if (filters.toDate) {
      result = result.filter((conference) => conference.endDate <= filters.toDate)
    }

    return result
  }

  async findById(id) {
    return this.conferences.find((conference) => conference.id === Number(id)) || null
  }

  createSync(data) {
    const timestamp = new Date().toISOString()
    const conference = {
      id: this.nextConferenceId,
      title: data.title,
      slug: buildSlug(data.title),
      description: data.description,
      category: data.category,
      status: data.status,
      modality: data.modality,
      timezone: data.timezone,
      capacity: data.capacity,
      availableSeats: data.availableSeats ?? data.capacity,
      tags: data.tags || [],
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: timestamp,
      updatedAt: timestamp,
      agenda: []
    }

    this.nextConferenceId += 1
    this.conferences.push(conference)
    return conference
  }

  async create(data) {
    return this.createSync(data)
  }

  async update(id, data) {
    const conference = await this.findById(id)
    if (!conference) {
      return null
    }

    Object.assign(conference, {
      title: data.title ?? conference.title,
      slug: data.title ? buildSlug(data.title) : conference.slug,
      description: data.description ?? conference.description,
      category: data.category ?? conference.category,
      status: data.status ?? conference.status,
      modality: data.modality ?? conference.modality,
      timezone: data.timezone ?? conference.timezone,
      capacity: data.capacity ?? conference.capacity,
      availableSeats: data.availableSeats ?? conference.availableSeats,
      tags: data.tags ?? conference.tags,
      startDate: data.startDate ?? conference.startDate,
      endDate: data.endDate ?? conference.endDate,
      updatedAt: new Date().toISOString()
    })

    return conference
  }

  async remove(id) {
    const index = this.conferences.findIndex((conference) => conference.id === Number(id))
    if (index === -1) {
      return null
    }

    const [deleted] = this.conferences.splice(index, 1)
    return deleted
  }

  async listCategories() {
    return [...new Set(this.conferences.map((conference) => conference.category))].sort()
  }

  async listStatuses() {
    return [...new Set(this.conferences.map((conference) => conference.status))].sort()
  }

  addAgendaItemSync(conferenceId, item) {
    const conference = this.conferences.find((currentConference) => currentConference.id === Number(conferenceId))
    if (!conference) {
      return null
    }

    const agendaItem = {
      id: this.nextAgendaId,
      title: item.title,
      speaker: item.speaker,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      room: item.room
    }

    this.nextAgendaId += 1
    conference.agenda.push(agendaItem)
    conference.updatedAt = new Date().toISOString()
    return agendaItem
  }

  async addAgendaItem(conferenceId, item) {
    return this.addAgendaItemSync(conferenceId, item)
  }
}

module.exports = {
  ConferenceMemoryRepository
}
