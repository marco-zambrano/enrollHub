import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from '@/pages/Landing'

describe('Landing accessibility', () => {
  it('should not have critical axe violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
