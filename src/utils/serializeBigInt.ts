/**
 * Convertit tous les BigInt d'un objet en Number (si possible) ou en String.
 * Utile pour éviter les erreurs de sérialisation JSON avec BigInt.
 */
export const serializeBigInt = (obj: any): any => {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value // Convertit BigInt en String
      )
    );
  };