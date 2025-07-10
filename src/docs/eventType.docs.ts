/**
 * @swagger
 * tags:
 *   name: Types d'Événements
 *   description: Gestion des types d’événements (heureux ou tristes)

 * /api/event-types:
 *   post:
 *     summary: Créer un type d'événement
 *     tags: [Types d'Événements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isHappyEvent:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Type d'événement créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Type d'événement déjà existant
 *
 *   get:
 *     summary: Obtenir tous les types d'événements
 *     tags: [Types d'Événements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des types d’événements

 * /api/event-types/{id}:
 *   get:
 *     summary: Obtenir un type d'événement par ID
 *     tags: [Types d'Événements]
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
 *         description: Type d'événement trouvé
 *       404:
 *         description: Type d'événement introuvable

 *   put:
 *     summary: Mettre à jour un type d'événement
 *     tags: [Types d'Événements]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isHappyEvent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Type d'événement mis à jour
 *       404:
 *         description: Type d'événement introuvable

 *   delete:
 *     summary: Supprimer un type d'événement
 *     tags: [Types d'Événements]
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
 *         description: Type d'événement supprimé
 *       404:
 *         description: Type d'événement introuvable
 *       409:
 *         description: Impossible de supprimer car des événements y sont liés
 */
