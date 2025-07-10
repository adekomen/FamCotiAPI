/**
 * @swagger
 * tags:
 *   name: Paramètres
 *   description: Gestion des paramètres système (réservée aux administrateurs)

 * /api/settings:
 *   post:
 *     summary: Créer un nouveau paramètre
 *     tags: [Paramètres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 example: "montant_cotisation_mensuelle"
 *               value:
 *                 type: string
 *                 example: "5000"
 *               description:
 *                 type: string
 *                 example: "Montant mensuel obligatoire à verser"
 *     responses:
 *       201:
 *         description: Paramètre créé avec succès
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Conflit, clé déjà existante
 *
 *   get:
 *     summary: Obtenir tous les paramètres
 *     tags: [Paramètres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paramètres existants

 * /api/settings/{key}:
 *   get:
 *     summary: Obtenir un paramètre par sa clé
 *     tags: [Paramètres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *           example: montant_cotisation_mensuelle
 *     responses:
 *       200:
 *         description: Paramètre trouvé
 *       404:
 *         description: Paramètre introuvable

 *   put:
 *     summary: Mettre à jour un paramètre par sa clé
 *     tags: [Paramètres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 example: "6000"
 *               description:
 *                 type: string
 *                 example: "Mise à jour du montant"
 *     responses:
 *       200:
 *         description: Paramètre mis à jour avec succès
 *       404:
 *         description: Paramètre introuvable

 *   delete:
 *     summary: Supprimer un paramètre par sa clé
 *     tags: [Paramètres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paramètre supprimé avec succès
 *       404:
 *         description: Paramètre introuvable
 */
