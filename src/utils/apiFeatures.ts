import { Request } from "express";
import { Prisma } from "@prisma/client"; // Importez Prisma ici

/**
 * Interface pour les options de requête génériques pour Prisma.
 * Cette interface accepte un type générique T pour le `where` et le `orderBy`
 * afin de s'adapter aux différents `ModelNameWhereInput` et `ModelNameOrderByWithRelationInput`.
 */
interface QueryOptions<WhereInput, OrderByInput> {
  where?: WhereInput; // Utilise le type WhereInput spécifique au modèle
  orderBy?: Prisma.Enumerable<OrderByInput>; // Utilise OrderByInput spécifique au modèle
  skip?: number;
  take?: number;
  include?: any;
  select?: any;
}

/**
 * Construit les options de requête pour Prisma (pagination, tri, filtrage).
 * @param reqQuery L'objet Request["query"] d'Express.
 * @param defaultLimit Le nombre d'éléments par page par défaut.
 * @param allowedSortFields Les champs sur lesquels le tri est autorisé.
 * @param searchableFields Les champs sur lesquels la recherche (filtrage textuel) est autorisée.
 * @returns Un objet d'options compatible avec Prisma `findMany`.
 */
export class APIFeatures<WhereInput, OrderByInput> {
  private query: Request["query"];
  private prismaOptions: QueryOptions<WhereInput, OrderByInput>;
  private allowedSortFields: string[];
  private searchableFields: string[];
  private defaultLimit: number;

  constructor(
    reqQuery: Request["query"],
    defaultLimit: number = 10,
    allowedSortFields: string[] = [],
    searchableFields: string[] = []
  ) {
    this.query = reqQuery;
    this.prismaOptions = {};
    this.allowedSortFields = allowedSortFields;
    this.searchableFields = searchableFields;
    this.defaultLimit = defaultLimit;
  }

  // 1. Pagination
  paginate() {
    const page = parseInt(this.query.page as string) || 1;
    const limit = parseInt(this.query.limit as string) || this.defaultLimit;
    const skip = (page - 1) * limit;

    this.prismaOptions.skip = skip;
    this.prismaOptions.take = limit;
    return this;
  }

  // 2. Tri (Sorting)
  sort() {
    if (this.query.sortBy) {
      const sortBy = this.query.sortBy as string;
      const sortOrder = (this.query.sortOrder as string) || "asc";

      if (this.allowedSortFields.includes(sortBy)) {
        this.prismaOptions.orderBy = {
          [sortBy]: sortOrder,
        } as unknown as OrderByInput; // Cast plus sûr vers OrderByInput
      }
    }
    return this;
  }

  // 3. Filtrage (Filtering)
  filter() {
    const queryObj = { ...this.query };
    const excludedFields = [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "search",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    let where: { [key: string]: any } = {};

    for (const key in queryObj) {
      if (Object.prototype.hasOwnProperty.call(queryObj, key)) {
        let value: any = queryObj[key]; // Utiliser 'any' ici pour permettre la réassignation de type

        // Conversion des chaînes 'true'/'false' en booléens, et des nombres
        if (typeof value === "string") {
          // S'assurer que 'value' est une string avant de tenter la conversion
          if (value === "true") {
            value = true;
          } else if (value === "false") {
            value = false;
          } else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) {
            value = Number(value);
          }
        }

        // Gérer les cas où le 'value' est un tableau (par exemple, pour des filtres "in")
        // Pour des filtres plus complexes comme gt, lt, gte, lte, vous devrez parser le format de la query string
        // Ex: price[gte]=100 => { price: { gte: 100 } }
        // Pour l'instant, on fait un filtrage par égalité simple
        where[key] = value;
      }
    }
    this.prismaOptions.where = {
      ...(this.prismaOptions.where as object),
      ...where,
    } as WhereInput; // Fusionner avec un where existant
    return this;
  }

  // 4. Recherche textuelle (Search)
  search() {
    if (this.query.search && this.searchableFields.length > 0) {
      const searchTerm = this.query.search as string;
      const searchConditions = this.searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }));

      // Combinez les conditions de recherche avec le `where` existant
      const currentWhere = (this.prismaOptions.where as object) || {};
      this.prismaOptions.where = {
        AND: [currentWhere, { OR: searchConditions }],
      } as WhereInput;
    }
    return this;
  }

  // Obtenir les options finales pour Prisma
  getPrismaOptions() {
    return this.prismaOptions;
  }
}
