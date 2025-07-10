/**
 * @swagger
 * tags:
 *   name: Assiduités
 *   description: Gestion des présences aux réunions

 * /api/meeting-attendances:
 *   post:
 *     summary: Enregistrer une assiduité à une réunion
 *     tags: [Assiduités]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meetingId
 *               - userId
 *               - attendanceStatus
 *             properties:
 *               meetingId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               attendanceStatus:
 *                 type: string
 *                 enum: [present, absent, excused]
 *               excuseReason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assiduité enregistrée avec succès
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Accès interdit
 *       409:
 *         description: Entrée déjà existante

 *   get:
 *     summary: Obtenir toutes les assiduités (admin ou utilisateur)
 *     tags: [Assiduités]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meetingId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, excused]
 *     responses:
 *       200:
 *         description: Liste des assiduités

 * /api/meeting-attendances/{meetingId}/{userId}:
 *   get:
 *     summary: Obtenir une assiduité par réunion et utilisateur
 *     tags: [Assiduités]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assiduité trouvée
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Entrée non trouvée

 *   put:
 *     summary: Mettre à jour une assiduité (admin ou utilisateur concerné)
 *     tags: [Assiduités]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
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
 *               attendanceStatus:
 *                 type: string
 *                 enum: [present, absent, excused]
 *               excuseReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assiduité mise à jour
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Entrée non trouvée

 *   delete:
 *     summary: Supprimer une assiduité (admin uniquement)
 *     tags: [Assiduités]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assiduité supprimée
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Entrée non trouvée
 */
