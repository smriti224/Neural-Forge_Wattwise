const STORAGE_KEY = "wattwise_known_rooms";

export function getStoredRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function saveRoom(roomId) {
  if (!roomId) return [];
  const normalized = String(roomId).trim();
  if (!normalized) return getStoredRooms();

  const rooms = getStoredRooms();
  const merged = Array.from(new Set([...rooms, normalized])).sort();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function mergeRooms(apiRooms = []) {
  const apiRoomIds = apiRooms
    .map((room) => (typeof room === "string" ? room : room?.room_id))
    .filter(Boolean)
    .map(String);

  const merged = Array.from(new Set([...getStoredRooms(), ...apiRoomIds])).sort();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
