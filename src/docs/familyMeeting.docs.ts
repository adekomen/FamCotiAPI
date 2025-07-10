/**
 * @swagger
 * tags:
 *   name: Réunions familiales
 *   description: Gestion des réunions familiales (admin et membres)

 * /api/family-meetings:
 *   post:
 *     summary: Créer une nouvelle réunion familiale (admin seulement)
 *     tags: [Réunions familiales]
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
 *               - meetingDate
 *               - location
 *               - startTime
 *               - createdById
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               meetingDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 example: "14:00"
 *               endTime:
 *                 type: string
 *                 example: "16:30"
 *               createdById:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Réunion créée avec succès
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Non autorisé

 *   get:
 *     summary: Obtenir toutes les réunions familiales (authentifié)
 *     tags: [Réunions familiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (filtrage)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (filtrage)
 *     responses:
 *       200:
 *         description: Liste des réunions

 * /api/family-meetings/{id}:
 *   get:
 *     summary: Obtenir une réunion familiale par ID (authentifié)
 *     tags: [Réunions familiales]
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
 *         description: Réunion trouvée
 *       404:
 *         description: Réunion introuvable

 *   put:
 *     summary: Mettre à jour une réunion familiale (admin seulement)
 *     tags: [Réunions familiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               meetingDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 example: "14:00"
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *     responses:
 *       200:
 *         description: Réunion mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Réunion introuvable

 *   delete:
 *     summary: Supprimer une réunion familiale (admin seulement)
 *     tags: [Réunions familiales]
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
 *         description: Réunion supprimée avec succès
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Réunion introuvable
 */
