/**
 * @swagger
 * tags:
 *   name: Membre - Assignation à une Catégorie
 *   description: Assignation des utilisateurs aux catégories de membres

 * /api/member-category-user:
 *   post:
 *     summary: Assigner un utilisateur à une catégorie
 *     tags: [Membre - Assignation à une Catégorie]
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
 *               - categoryId
 *             properties:
 *               userId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Utilisateur assigné avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: L'utilisateur est déjà assigné
 *
 *   get:
 *     summary: Obtenir toutes les assignations
 *     tags: [Membre - Assignation à une Catégorie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Liste des assignations
 *
 * /api/member-category-user/{userId}/{categoryId}:
 *   get:
 *     summary: Obtenir une assignation spécifique
 *     tags: [Membre - Assignation à une Catégorie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'assignation
 *       404:
 *         description: Assignation non trouvée
 *
 *   delete:
 *     summary: Supprimer une assignation
 *     tags: [Membre - Assignation à une Catégorie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignation supprimée avec succès
 *       404:
 *         description: Assignation non trouvée
 */
