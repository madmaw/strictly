import {
  jsonPath,
  jsonPathPrefix,
  jsonPathUnprefix,
} from 'transformers/flatteners/json_path'

describe('json_paths', () => {
  describe('jsonPath', () => {
    describe('simple', () => {
      const path = jsonPath('$', 'thing')

      it('has the expected type', () => {
        expectTypeOf(path).toEqualTypeOf<'$.thing'>()
      })

      it('has the expected value', () => {
        expect(path).toEqual('$.thing')
      })
    })

    describe('indexed', () => {
      const path = jsonPath<`$.${number}`, number>(`$.${1}`, 1)

      it('has the expected type', () => {
        expectTypeOf(path).toEqualTypeOf<`$.${number}.${number}`>()
      })

      it('has the expected value', () => {
        expect(path).toEqual('$.1.1')
      })
    })

    describe('qualified', () => {
      const path = jsonPath('$', 'x', ':y')

      it('has the expected type', () => {
        expectTypeOf(path).toEqualTypeOf<'$:y.x'>()
      })

      it('has the expected value', () => {
        expect(path).toEqual('$:y.x')
      })
    })
  })

  describe('jsonPathPrefix', () => {
    const path = jsonPathPrefix('$.x', '$.x.y')

    it('has the expected type', () => {
      expectTypeOf(path).toEqualTypeOf<'$.x.x.y'>()
    })

    it('has the expected value', () => {
      expect(path).toEqual('$.x.x.y')
    })
  })

  describe('jsonPathUnprefix', () => {
    const path = jsonPathUnprefix('$.x.x.x', '$.x.x.x.x.y')

    it('has the expected type', () => {
      expectTypeOf(path).toEqualTypeOf<'$.x.y'>()
    })

    it('has the expected value', () => {
      expect(path).toEqual('$.x.y')
    })
  })
})
