import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu'

describe('AccessibilityMenu', () => {
  it('should not have critical axe violations when closed', async () => {
    const { container } = render(<AccessibilityMenu />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('opens and closes with keyboard', async () => {
    const user = userEvent.setup()
    render(<AccessibilityMenu />)

    const trigger = screen.getByRole('button', { name: /abrir menú de accesibilidad/i })
    await user.click(trigger)

    expect(screen.getByRole('complementary', { name: /menú de accesibilidad/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cerrar menú de accesibilidad/i }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
})
