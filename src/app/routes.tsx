import type { ComponentType } from 'react'
import Onboarding from '@/pages/Onboarding'
import Interests from '@/pages/Interests'
import Traits from '@/pages/Traits'
import Destination from '@/pages/Destination'
import Discover from '@/pages/Discover'

type R = { path: string; element: ComponentType }
const routes: R[] = [
  { path: '/', element: Onboarding },
  { path: '/interests', element: Interests },
  { path: '/traits', element: Traits },
  { path: '/destination', element: Destination },
  { path: '/discover', element: Discover }
]

export default routes