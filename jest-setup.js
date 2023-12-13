import { configure } from '@testing-library/react'
import '@testing-library/jest-dom'

beforeEach(() => {
    configure({ testIdAttribute: 'data-test' })
})
