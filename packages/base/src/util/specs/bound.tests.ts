import { bound } from 'util/bound'

describe('bound', () => {
  describe('class method', () => {
    class C {
      x = 1

      @bound
      inc(...amount: number[]) {
        this.x = amount.reduce((acc, n) => acc + n, this.x)
        return this.x
      }

      @bound
      dec() {
        return --this.x
      }
    }
    let c: C
    let inc: (...n: number[]) => number
    let dec: () => number

    beforeEach(() => {
      c = new C()
      inc = c.inc
      dec = c.dec
    })

    it('starts with the expected value', () => {
      expect(c.x).toBe(1)
    })

    it('allows bound calling of inc with no parameters', () => {
      const result = inc()

      expect(c.x).toBe(1)
      expect(result).toBe(1)
    })

    it('allows bound calling of inc with 1 parameter', () => {
      const result = inc(1)

      expect(c.x).toBe(2)
      expect(result).toBe(2)
    })

    it('allows bound calling of inc with multiple parameters', () => {
      const result = inc(1, 2, 4, 5)

      expect(c.x).toBe(13)
      expect(result).toBe(13)
    })

    it('allows calling of c.inc', () => {
      const result = c.inc(2)

      expect(c.x).toBe(3)
      expect(result).toBe(3)
    })

    it('allows bound calling of dec', () => {
      const result = dec()

      expect(result).toBe(0)
      expect(c.x).toBe(0)
    })
  })
})
