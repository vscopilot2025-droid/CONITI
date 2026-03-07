import { GetLandingDocument } from '../application/use-cases/GetLandingDocument'
import { HttpLandingPageRepository } from '../infrastructure/repositories/HttpLandingPageRepository'
import { LegacyLandingView } from './components/LegacyLandingView'

const landingPageRepository = new HttpLandingPageRepository()
const getLandingDocumentUseCase = new GetLandingDocument(landingPageRepository)

export default function App() {
  return <LegacyLandingView getLandingDocumentUseCase={getLandingDocumentUseCase} />
}
