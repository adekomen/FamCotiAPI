/**
 * @swagger
 * tags:
 *   name: Contributions Mensuelles
 *   description: Gestion des contributions mensuelles des membres

 * /api/monthly-contributions:
 *   post:
 *     summary: Créer une contribution mensuelle
 *     tags: [Contributions Mensuelles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *               - month
 *               - year
 *               - paymentDate
 *             properties:
 *               userId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               year:
 *                 type: integer
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
 *         description: Contribution enregistrée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Non autorisé
 *       409:
 *         description: Contribution déjà enregistrée pour ce mois/année
 *
 *   get:
 *     summary: Obtenir toutes les contributions mensuelles (avec filtres)
 *     tags: [Contributions Mensuelles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: month
 *         in: query
 *         schema:
 *           type: integer
 *       - name: year
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des contributions
 *
 * /api/monthly-contributions/{id}:
 *   get:
 *     summary: Obtenir une contribution par ID
 *     tags: [Contributions Mensuelles]
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
 *         description: Contribution trouvée
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Contribution introuvable
 *
 *   put:
 *     summary: Mettre à jour une contribution
 *     tags: [Contributions Mensuelles]
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
 *               amount:
 *                 type: number
 *               month:
 *                 type: integer
 *               year:
 *                 type: integer
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
 *         description: Non autorisé
 *       404:
 *         description: Contribution introuvable
 *
 *   delete:
 *     summary: Supprimer une contribution
 *     tags: [Contributions Mensuelles]
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
 *         description: Contribution supprimée
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Contribution introuvable
 */
