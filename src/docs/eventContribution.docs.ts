/**
 * @swagger
 * tags:
 *   name: Contributions Événements
 *   description: Gestion des contributions liées aux événements

 * /api/event-contributions:
 *   post:
 *     summary: Créer une contribution à un événement
 *     tags: [Contributions Événements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - userId
 *               - amount
 *               - paymentDate
 *             properties:
 *               eventId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               transactionReference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contribution créée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Non autorisé à créer pour un autre utilisateur
 *       404:
 *         description: Événement ou utilisateur introuvable

 *   get:
 *     summary: Obtenir toutes les contributions d’événements (avec filtres optionnels)
 *     tags: [Contributions Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID d'événement
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID d'utilisateur
 *     responses:
 *       200:
 *         description: Liste des contributions

 * /api/event-contributions/{id}:
 *   get:
 *     summary: Obtenir une contribution d’événement par ID
 *     tags: [Contributions Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la contribution
 *     responses:
 *       200:
 *         description: Contribution trouvée
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Contribution introuvable

 *   put:
 *     summary: Mettre à jour une contribution d’événement
 *     tags: [Contributions Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la contribution
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               transactionReference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contribution mise à jour
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Contribution introuvable

 *   delete:
 *     summary: Supprimer une contribution d’événement
 *     tags: [Contributions Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la contribution
 *     responses:
 *       200:
 *         description: Contribution supprimée
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Contribution introuvable
 */
