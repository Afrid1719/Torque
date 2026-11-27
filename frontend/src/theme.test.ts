import { torqueTheme } from '@app/theme'

describe('TORQUE typography', () => {
  it('uses the supplied Steel and Azure type scale', () => {
    expect(torqueTheme.typography.fontFamily).toBe('"Inter", sans-serif')
    expect(torqueTheme.typography.h4).toMatchObject({
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '40px',
    })
    expect(torqueTheme.typography.h5).toMatchObject({
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '32px',
    })
    expect(torqueTheme.typography.h6).toMatchObject({
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '28px',
    })
    expect(torqueTheme.typography.body1).toMatchObject({
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
    })
    expect(torqueTheme.typography.body2).toMatchObject({
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    })
    expect(torqueTheme.typography.subtitle1).toMatchObject({
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '18px',
    })
    expect(torqueTheme.typography.caption).toMatchObject({
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '14px',
    })
  })

  it('uses the supplied Steel and Azure content colors', () => {
    expect(torqueTheme.palette.text.primary).toBe('#191c1e')
    expect(torqueTheme.palette.text.secondary).toBe('#424754')
    expect(torqueTheme.palette.divider).toBe('#c2c6d6')
    expect(torqueTheme.palette.primary.main).toBe('#0058be')
    expect(torqueTheme.palette.secondary.main).toBe('#515f74')
  })
})
