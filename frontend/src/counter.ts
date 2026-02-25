export function setupCounter(element: HTMLButtonElement): () => void {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  const handler = () => setCounter(counter + 1)
  element.addEventListener('click', handler)
  setCounter(0)
  return () => element.removeEventListener('click', handler)
}
