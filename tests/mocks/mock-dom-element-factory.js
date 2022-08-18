
export default function MockDomElementFactory() {
    return {
        classList: {
            add: jest.fn(),
            remove: jest.fn()
        }
    }
}