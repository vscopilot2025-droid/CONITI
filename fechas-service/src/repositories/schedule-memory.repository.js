const {
  defaultAvailabilities,
  defaultConflicts,
  defaultMasterAgenda
} = require('../data/default-schedules')

class ScheduleMemoryRepository {
  constructor() {
    this.nextAvailabilityId = 1
    this.nextConflictId = 1
    this.nextAgendaId = 1
    this.availabilities = []
    this.conflicts = []
    this.masterAgenda = []
    this.seedDefaults()
  }

  seedDefaults() {
    defaultAvailabilities.forEach((entry) => this.createAvailabilitySync(entry))
    defaultConflicts.forEach((entry) => this.createConflictSync(entry))
    defaultMasterAgenda.forEach((entry) => this.createMasterAgendaEntrySync(entry))
  }

  normalizeAvailability(entry) {
    return {
      id: entry.id,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      resourceName: entry.resourceName,
      timezone: entry.timezone,
      startsAt: entry.startsAt,
      endsAt: entry.endsAt,
      status: entry.status,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }

  normalizeConflict(entry) {
    return {
      id: entry.id,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      resourceName: entry.resourceName,
      startsAt: entry.startsAt,
      endsAt: entry.endsAt,
      severity: entry.severity,
      reason: entry.reason,
      createdAt: entry.createdAt
    }
  }

  normalizeAgendaEntry(entry) {
    return {
      id: entry.id,
      eventType: entry.eventType,
      eventId: entry.eventId,
      title: entry.title,
      timezone: entry.timezone,
      startsAt: entry.startsAt,
      endsAt: entry.endsAt,
      owner: entry.owner,
      location: entry.location,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }

  createAvailabilitySync(data) {
    const timestamp = new Date().toISOString()
    const record = {
      id: this.nextAvailabilityId++,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      resourceName: data.resourceName,
      timezone: data.timezone,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      status: data.status,
      notes: data.notes || '',
      createdAt: timestamp,
      updatedAt: timestamp
    }

    this.availabilities.push(record)
    return this.normalizeAvailability(record)
  }

  createConflictSync(data) {
    const record = {
      id: this.nextConflictId++,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      resourceName: data.resourceName,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      severity: data.severity,
      reason: data.reason,
      createdAt: new Date().toISOString()
    }

    this.conflicts.push(record)
    return this.normalizeConflict(record)
  }

  createMasterAgendaEntrySync(data) {
    const timestamp = new Date().toISOString()
    const record = {
      id: this.nextAgendaId++,
      eventType: data.eventType,
      eventId: data.eventId,
      title: data.title,
      timezone: data.timezone,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      owner: data.owner,
      location: data.location,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    this.masterAgenda.push(record)
    return this.normalizeAgendaEntry(record)
  }

  async listAvailabilities(filters = {}) {
    let result = [...this.availabilities]

    if (filters.resourceType) {
      result = result.filter((entry) => entry.resourceType === filters.resourceType)
    }
    if (filters.resourceId) {
      result = result.filter((entry) => Number(entry.resourceId) === Number(filters.resourceId))
    }
    if (filters.status) {
      result = result.filter((entry) => entry.status === filters.status)
    }
    if (filters.timezone) {
      result = result.filter((entry) => entry.timezone === filters.timezone)
    }

    return result.map((entry) => this.normalizeAvailability(entry))
  }

  async createAvailability(data) {
    return this.createAvailabilitySync(data)
  }

  async listConflicts(filters = {}) {
    let result = [...this.conflicts]

    if (filters.resourceType) {
      result = result.filter((entry) => entry.resourceType === filters.resourceType)
    }
    if (filters.resourceId) {
      result = result.filter((entry) => Number(entry.resourceId) === Number(filters.resourceId))
    }
    if (filters.severity) {
      result = result.filter((entry) => entry.severity === filters.severity)
    }

    return result.map((entry) => this.normalizeConflict(entry))
  }

  async createConflict(data) {
    return this.createConflictSync(data)
  }

  async listTimezones() {
    return [...new Set(this.availabilities.map((entry) => entry.timezone))].sort()
  }

  async listMasterAgenda(filters = {}) {
    let result = [...this.masterAgenda]

    if (filters.owner) {
      result = result.filter((entry) => entry.owner === filters.owner)
    }
    if (filters.eventType) {
      result = result.filter((entry) => entry.eventType === filters.eventType)
    }
    if (filters.timezone) {
      result = result.filter((entry) => entry.timezone === filters.timezone)
    }

    return result
      .sort((left, right) => new Date(left.startsAt) - new Date(right.startsAt))
      .map((entry) => this.normalizeAgendaEntry(entry))
  }

  async createMasterAgendaEntry(data) {
    return this.createMasterAgendaEntrySync(data)
  }
}

module.exports = {
  ScheduleMemoryRepository
}
