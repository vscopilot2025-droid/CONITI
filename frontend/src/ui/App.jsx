import { GetLandingDocument } from '../application/use-cases/GetLandingDocument'
import { GetFeaturedSpeakers } from '../application/use-cases/GetFeaturedSpeakers'
import { HttpLandingPageRepository } from '../infrastructure/repositories/HttpLandingPageRepository'
import { HttpSpeakerRepository } from '../infrastructure/repositories/HttpSpeakerRepository'
import { LegacyLandingView } from './components/LegacyLandingView'

const landingPageRepository = new HttpLandingPageRepository()
const getLandingDocumentUseCase = new GetLandingDocument(landingPageRepository)
const speakerRepository = new HttpSpeakerRepository()
const getFeaturedSpeakersUseCase = new GetFeaturedSpeakers(speakerRepository)

export default function App() {
  return (
    <LegacyLandingView
      getLandingDocumentUseCase={getLandingDocumentUseCase}
      getFeaturedSpeakersUseCase={getFeaturedSpeakersUseCase}
    />
  )
}
