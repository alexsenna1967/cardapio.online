import { prisma } from "./prisma";

export async function getStoreConfig() {
  let store = await prisma.store.findFirst({
    include: {
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      deliveryZones: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "Meu Negócio",
        phone: "5500000000000",
        address: "Endereço do Estabelecimento",
        themeColor: "#ea580c",
        deliveryMode: "fixed",
        deliveryFee: 0,
      },
      include: {
        businessHours: { orderBy: { dayOfWeek: "asc" } },
        deliveryZones: { orderBy: { sortOrder: "asc" } },
      },
    });
  }

  return store;
}

export function checkIfOpen(
  businessHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>
): boolean {
  if (!businessHours || businessHours.length === 0) return true;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) =>
    parts.find((p: Intl.DateTimeFormatPart) => p.type === type)?.value ?? "";

  const spDate = new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00`
  );
  const dayOfWeek = spDate.getDay();
  const currentTime = `${get("hour")}:${get("minute")}`;

  const todayHours = businessHours.find(
    (h: { dayOfWeek: number }) => h?.dayOfWeek === dayOfWeek
  );
  if (!todayHours || todayHours.isClosed) return false;

  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
}
