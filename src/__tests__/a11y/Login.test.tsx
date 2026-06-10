import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { Login } from '@/pages/auth/Login'

describe('Login accessibility', () => {
  it('should not have critical axe violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
