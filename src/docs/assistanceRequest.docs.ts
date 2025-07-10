/**
 * @swagger
 * tags:
 *   name: Demandes d'assistance
 *   description: Gestion des demandes d'assistance financières

 * /api/assistance-requests:
 *   post:
 *     summary: Créer une demande d'assistance
 *     tags: [Demandes d'assistance]
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
 *               - title
 *               - description
 *               - amountRequested
 *             properties:
 *               userId:
 *                 type: integer
 *               eventId:
 *                 type: integer
 *                 nullable: true
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amountRequested:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, paid]
 *               approvedAmount:
 *                 type: number
 *                 nullable: true
 *               approvalDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               rejectedReason:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Demande créée avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Événement spécifié non trouvé

 *   get:
 *     summary: Obtenir toutes les demandes d’assistance (admin ou utilisateur connecté)
 *     tags: [Demandes d'assistance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID utilisateur
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID événement
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *         description: Filtrer par statut
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans les titres, descriptions ou statuts
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Tri, ex: createdAt:desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des demandes avec pagination

 * /api/assistance-requests/{id}:
 *   get:
 *     summary: Obtenir une demande d’assistance par ID
 *     tags: [Demandes d'assistance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande
 *     responses:
 *       200:
 *         description: Détails de la demande trouvée
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Demande introuvable

 *   put:
 *     summary: Mettre à jour une demande d’assistance
 *     tags: [Demandes d'assistance]
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
 *               eventId:
 *                 type: integer
 *                 nullable: true
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amountRequested:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, paid]
 *     responses:
 *       200:
 *         description: Demande mise à jour avec succès
 *       403:
 *         description: Non autorisé à mettre à jour
 *       404:
 *         description: Demande non trouvée

 *   delete:
 *     summary: Supprimer une demande d’assistance
 *     tags: [Demandes d'assistance]
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
 *         description: Demande supprimée avec succès
 *       403:
 *         description: Non autorisé à supprimer
 *       404:
 *         description: Demande non trouvée
 */
