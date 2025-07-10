/**
 * @swagger
 * tags:
 *   name: Sanctions
 *   description: Gestion des sanctions des membres (admin et membres)

 * /api/sanctions:
 *   post:
 *     summary: Créer une nouvelle sanction (admin seulement)
 *     tags: [Sanctions]
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
 *               - reason
 *               - startDate
 *               - createdById
 *             properties:
 *               userId:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               createdById:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sanction créée avec succès
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur sanctionné introuvable

 *   get:
 *     summary: Obtenir toutes les sanctions
 *     tags: [Sanctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID utilisateur (admin seulement)
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Filtrer par état de résolution (true/false)
 *     responses:
 *       200:
 *         description: Liste des sanctions

 * /api/sanctions/{id}:
 *   get:
 *     summary: Obtenir une sanction par ID
 *     tags: [Sanctions]
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
 *         description: Sanction trouvée
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Sanction introuvable

 *   put:
 *     summary: Mettre à jour une sanction (admin seulement)
 *     tags: [Sanctions]
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
 *               reason:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               resolvedAt:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               resolvedById:
 *                 type: integer
 *                 nullable: true
 *               resolutionNotes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Sanction mise à jour avec succès
 *       400:
 *         description: Champs non autorisés ou invalides
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Sanction ou utilisateur non trouvé

 *   delete:
 *     summary: Supprimer une sanction (admin seulement)
 *     tags: [Sanctions]
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
 *         description: Sanction supprimée avec succès
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Sanction introuvable
 */
