/**
 * @swagger
 * tags:
 *   name: Événements
 *   description: Gestion des événements familiaux

 * /api/events:
 *   post:
 *     summary: Créer un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - location
 *               - eventTypeId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               eventTypeId:
 *                 type: integer
 *               concernedUserId:
 *                 type: integer
 *               isPrivate:
 *                 type: boolean
 *               isRecurring:
 *                 type: boolean
 *               recurrencePattern:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               contributionRequired:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Type d'événement ou utilisateur concerné introuvable
 *       409:
 *         description: Conflit

 *   get:
 *     summary: Obtenir tous les événements
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements

 * /api/events/{id}:
 *   get:
 *     summary: Obtenir un événement par ID
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l’événement
 *     responses:
 *       200:
 *         description: Événement trouvé
 *       404:
 *         description: Événement introuvable
 *       403:
 *         description: Accès non autorisé (événement privé)

 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l’événement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               eventTypeId:
 *                 type: integer
 *               concernedUserId:
 *                 type: integer
 *               isPrivate:
 *                 type: boolean
 *               isRecurring:
 *                 type: boolean
 *               recurrencePattern:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               contributionRequired:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *       404:
 *         description: Événement ou type/concernedUser introuvable
 *       403:
 *         description: Non autorisé

 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l’événement
 *     responses:
 *       200:
 *         description: Événement supprimé
 *       404:
 *         description: Événement introuvable
 *       403:
 *         description: Non autorisé
 */
