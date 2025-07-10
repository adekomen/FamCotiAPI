/**
 * @swagger
 * tags:
 *   name: Transactions de fonds
 *   description: Gestion des mouvements financiers (crédit, débit)

 * /api/fund-transactions:
 *   post:
 *     summary: Créer une nouvelle transaction de fonds (admin seulement)
 *     tags: [Transactions de fonds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionType
 *               - amount
 *               - transactionDate
 *               - balanceAfter
 *               - createdById
 *             properties:
 *               transactionType:
 *                 type: string
 *                 enum: [credit, debit]
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *                 nullable: true
 *               transactionDate:
 *                 type: string
 *                 format: date
 *               balanceAfter:
 *                 type: number
 *               createdById:
 *                 type: integer
 *               monthlyContributionId:
 *                 type: integer
 *                 nullable: true
 *               eventContributionId:
 *                 type: integer
 *                 nullable: true
 *               assistanceRequestId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Transaction créée avec succès
 *       400:
 *         description: Erreur de validation ou conflit de relation
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Ressource liée introuvable

 *   get:
 *     summary: Récupérer toutes les transactions de fonds (admin seulement)
 *     tags: [Transactions de fonds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [credit, debit]
 *         description: Filtrer par type
 *       - in: query
 *         name: createdById
 *         schema:
 *           type: integer
 *       - in: query
 *         name: monthlyContributionId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: eventContributionId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: assistanceRequestId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des transactions de fonds

 * /api/fund-transactions/{id}:
 *   get:
 *     summary: Obtenir une transaction de fonds par ID (admin seulement)
 *     tags: [Transactions de fonds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction trouvée
 *       404:
 *         description: Transaction introuvable

 *   put:
 *     summary: Mettre à jour une transaction de fonds (admin seulement)
 *     tags: [Transactions de fonds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionType:
 *                 type: string
 *                 enum: [credit, debit]
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *                 nullable: true
 *               transactionDate:
 *                 type: string
 *                 format: date
 *               balanceAfter:
 *                 type: number
 *               createdById:
 *                 type: integer
 *               monthlyContributionId:
 *                 type: integer
 *                 nullable: true
 *               eventContributionId:
 *                 type: integer
 *                 nullable: true
 *               assistanceRequestId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Transaction mise à jour avec succès
 *       400:
 *         description: Conflit de relation ou erreur de validation
 *       404:
 *         description: Transaction ou ressource liée introuvable

 *   delete:
 *     summary: Supprimer une transaction de fonds (admin seulement)
 *     tags: [Transactions de fonds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction supprimée avec succès
 *       404:
 *         description: Transaction introuvable
 */
