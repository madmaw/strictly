import { useCallback } from 'react'

export default function Button () {
  const onClick = useCallback(function () {
    // eslint-disable-next-line no-console
    console.log('click')
  }, [])
  return (
    <div>
      <button onClick={onClick}>
        Click
      </button>
    </div>
  )
}
