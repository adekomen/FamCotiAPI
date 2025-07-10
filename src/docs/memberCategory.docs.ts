/**
 * @swagger
 * tags:
 *   name: MemberCategory
 *   description: Gestion des catégories de membres
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MemberCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         monthlyContributionAmount:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /member-categories:
 *   post:
 *     summary: Créer une nouvelle catégorie de membre
 *     tags: [MemberCategory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - monthlyContributionAmount
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Étudiant"
 *               description:
 *                 type: string
 *                 example: "Membres encore en formation ou à charge"
 *               monthlyContributionAmount:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Catégorie créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberCategory'
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Catégorie déjà existante
 */

/**
 * @swagger
 * /member-categories:
 *   get:
 *     summary: Obtenir toutes les catégories de membres
 *     tags: [MemberCategory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MemberCategory'
 */

/**
 * @swagger
 * /member-categories/{id}:
 *   get:
 *     summary: Obtenir une catégorie de membre par ID
 *     tags: [MemberCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Détails de la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberCategory'
 *       404:
 *         description: Catégorie introuvable
 */

/**
 * @swagger
 * /member-categories/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie de membre
 *     tags: [MemberCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la catégorie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               monthlyContributionAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *       400:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /member-categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie de membre
 *     tags: [MemberCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catégorie supprimée
 *       404:
 *         description: Catégorie introuvable
 */
