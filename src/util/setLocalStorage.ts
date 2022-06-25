export function setLocalStorage<T>(value: T) {
  localStorage.setItem('@RocketShoes:cart', JSON.stringify(value));
}
