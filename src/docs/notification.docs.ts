/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications système

 * /api/notifications:
 *   post:
 *     summary: Créer une notification (admin uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - notifiableType
 *               - notifiableId
 *               - data
 *             properties:
 *               type:
 *                 type: string
 *                 example: "sanction_appliquee"
 *               notifiableType:
 *                 type: string
 *                 example: "User"
 *               notifiableId:
 *                 type: integer
 *                 example: 1
 *               data:
 *                 type: string
 *                 example: '{"message": "Une sanction a été appliquée."}'
 *     responses:
 *       201:
 *         description: Notification créée avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Entité notifiable introuvable
 *       403:
 *         description: Accès interdit

 *   get:
 *     summary: Obtenir toutes les notifications (admin ou utilisateur concerné)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: notifiableType
 *         schema:
 *           type: string
 *       - in: query
 *         name: notifiableId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *           description: true pour lues, false pour non lues
 *     responses:
 *       200:
 *         description: Liste des notifications
 *
 * /api/notifications/{id}:
 *   get:
 *     summary: Obtenir une notification par ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification trouvée
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Notification introuvable
 *
 *   delete:
 *     summary: Supprimer une notification (admin uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification supprimée
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Notification introuvable
 *
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Notification introuvable
 */
