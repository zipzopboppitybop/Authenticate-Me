const express = require('express');
const { Op } = require("sequelize");
const { Spot, Review, User, sequelize, SpotImage } = require('../../db/models');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Name is required'),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Price per day is required'),
    handleValidationErrors
];
const validateSpotEdit = [
    check('address')

        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .isEmpty()
        .withMessage('City is required'),
    check('state')
        .isEmpty()
        .withMessage('State is required'),
    check('country')
        .isEmpty()
        .withMessage('Country is required'),
    check('lat')
        .isEmpty()
        .withMessage('Latitude is not valid'),
    check('lng')
        .isEmpty()
        .withMessage('Longitude is not valid'),
    check('name')
        .isEmpty()
        .withMessage('Name is required'),
    check('name')
        .isEmpty()
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .isEmpty()
        .withMessage('Description is required'),
    check('price')
        .isEmpty()
        .withMessage('Price is required'),
    handleValidationErrors
];
//Work on errors
const router = express.Router();

router.get("/", async (req, res) => {
    const allSpots = await Spot.findAll({
        include: [
            {
                model: Review
            },
            {
                model: SpotImage
            }
        ]
    });

    const spotData = [];

    for (let i = 0; i < allSpots.length; i++) {
        const spot = allSpots[i];

        spotData.push(spot.toJSON());
    }

    for (let i = 0; i < spotData.length; i++) {
        const spot = spotData[i];
        if (spot.SpotImages.length > 0) {
            for (let j = 0; j < spot.SpotImages.length; j++) {
                const image = spot.SpotImages[j];

                if (image.preview === true) spot.previewImage = image.url;
            }
            if (!spot.previewImage) spot.previewImage = "No Preview Image";
        } else spot.previewImage = "No Preview Image";

        const ratings = await Review.findOne({
            where: {
                spotId: spot.id
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']
            ]
        })
        let reviewAvg = ratings.toJSON().avgRating
        if (reviewAvg) spot.avgRating = reviewAvg;
        else spot.avgRating = "No Review Yet"


        delete spot.SpotImages;
        delete spot.Reviews;
    }

    res.json(spotData);
})

//Get Current User's Spots
router.get(
    '/current',
    restoreUser,
    async (req, res) => {
        const { user } = req;

        if (!user) {
            const err = new Error();
            err.message = "Authentication required";
            err.statusCode = 401;
            res.status(401);
            res.json(err);
        }

        const userSpots = await Spot.findAll({
            where: {
                ownerId: user.id
            },
            include: [
                {
                    model: Review
                },
                {
                    model: SpotImage
                }
            ]
        })
        const spotData = [];

        for (let i = 0; i < userSpots.length; i++) {
            const spot = userSpots[i];

            spotData.push(spot.toJSON());
        }
        for (let i = 0; i < spotData.length; i++) {
            const spot = spotData[i];
            if (spot.SpotImages.length > 0) {
                for (let j = 0; j < spot.SpotImages.length; j++) {
                    const image = spot.SpotImages[j];

                    if (image.preview === true) spot.previewImage = image.url;
                }
                if (!spot.previewImage) spot.previewImage = "No Preview Image";
            } else spot.previewImage = "No Preview Image";

            const ratings = await Review.findOne({
                where: {
                    spotId: spot.id
                },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']
                ]
            })
            let reviewAvg = ratings.toJSON().avgRating
            if (reviewAvg) spot.avgRating = reviewAvg;
            else spot.avgRating = "No Review Yet"


            delete spot.SpotImages;
            delete spot.Reviews;
        }

        return res.json({
            Spots: spotData
        })
    }
);

//Get Details Of Current Spot From Id
router.get(
    '/:spotId',
    async (req, res) => {
        const currentSpot = await Spot.findByPk(req.params.spotId, {
            include: [
                {
                    model: Review
                },
                {
                    model: User,
                    attributes: ["id", "firstName", "lastName"]
                }
            ],
        })

        if (!currentSpot) {
            const err = Error();
            err.message = "Spot couldn't be found";
            err.statusCode = 404;
            res.status(404);
            return res.json(err);
        }

        const currentSpotData = currentSpot.toJSON();

        const ratings = await Review.findOne({
            where: {
                spotId: currentSpot.id
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating'],
            ]
        })

        const count = await Review.findOne({
            where: {
                spotId: currentSpot.id
            },
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("id")), 'numReviews']
            ]
        })

        const currentSpotImages = await SpotImage.findAll({
            where: {
                spotId: currentSpot.id
            },
            attributes: ["id", "url", "preview"]
        })

        let reviewAvg = ratings.toJSON().avgStarRating
        let reviewCount = count.toJSON().numReviews

        if (reviewCount) currentSpotData.numReviews = reviewCount;
        else currentSpotData.numReviews = "No Reviews Yet"
        if (reviewAvg) currentSpotData.avgStarRating = reviewAvg;
        else currentSpotData.avgStarRating = "No Reviews Yet"

        currentSpotData.SpotImages = currentSpotImages
        currentSpotData.Owner = currentSpotData.User

        delete currentSpotData.User
        delete currentSpotData.Reviews;

        res.json(currentSpotData)
    }
)

//Create A Spot
router.post(
    '/',
    validateSpot,
    restoreUser,
    async (req, res) => {
        const { user } = req;
        if (!user) {
            const err = new Error();
            err.message = "Authentication required";
            err.statusCode = 401;
            res.status(401);
            res.json(err);
        }

        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        const newSpot = await Spot.create({
            ownerId: user.id, address, city, state, country, lat, lng, name, description, price
        })

        res.json(newSpot)
    }
)

//Create An Image on Spot (Can only create image on spot you own)
router.post(
    '/:spotId/images',
    restoreUser,
    async (req, res) => {
        const { user } = req;
        if (!user) {
            const err = new Error();
            err.message = "Authentication required";
            err.statusCode = 401;
            res.status(401);
            return res.json(err);
        }

        const currentSpot = await Spot.findByPk(req.params.spotId)

        if (!currentSpot) {
            const err = Error();
            err.message = "Spot couldn't be found";
            err.statusCode = 404;
            res.status(404);
            return res.json(err);
        }

        if (user.id !== currentSpot.ownerId) {
            const err = new Error();
            err.message = "Forbidden";
            err.statusCode = 403;
            res.status(403);
            return res.json(err);
        }

        const { url, preview } = req.body;

        const newImage = await SpotImage.create({
            spotId: currentSpot.id, url, preview,
        })

        const newImageData = newImage.toJSON();

        delete newImageData.createdAt;
        delete newImageData.updatedAt;
        delete newImageData.spotId;

        res.json(newImageData);
    }
)

//Edit A Spot
router.put(
    '/:spotId',
    restoreUser,
    async (req, res) => {
        const { user } = req;
        let errorsLength = 0;
        const validationError = new Error();

        validationError.message = "Validation Error"
        validationError.statusCode = 400;
        validationError.errors = {};

        if (!user) {
            const err = new Error();
            err.message = "Authentication required";
            err.statusCode = 401;
            res.status(401);
            return res.json(err);
        }

        const currentSpot = await Spot.findByPk(req.params.spotId)

        if (!currentSpot) {
            const err = Error();
            err.message = "Spot couldn't be found";
            err.statusCode = 404;
            res.status(404);
            return res.json(err);
        }

        if (user.id !== currentSpot.ownerId) {
            const err = new Error();
            err.message = "Forbidden";
            err.statusCode = 403;
            res.status(403);
            return res.json(err);
        }

        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if (address) {
            if (address !== undefined) {
                currentSpot.address = address;
            } else if (address === undefined) {
                console.log(address);
                errorsLength += 1;
                validationError.errors.address = "Street address is required";
            }
        } else {
            console.log(address);
            errorsLength += 1;
            validationError.errors.address = "Street address is required";
        }

        if (city !== undefined) currentSpot.city = city;
        if (state !== undefined) currentSpot.state = state;
        if (country !== undefined) currentSpot.country = country;
        if (lat !== undefined) currentSpot.lat = lat;
        if (lng !== undefined) currentSpot.lng = lng;
        if (name !== undefined) currentSpot.name = name;
        if (description !== undefined) currentSpot.description = description;
        if (price !== undefined) currentSpot.price = price;

        if (errorsLength > 0) {
            res.status(400)
            return res.json(validationError);
        }
        await currentSpot.save();

        res.json(currentSpot);
    }
)

//Delete a Spot
router.delete(
    '/:spotId',
    restoreUser,
    async (req, res) => {
        const { user } = req;
        if (!user) {
            const err = new Error();
            err.message = "Authentication required";
            err.statusCode = 401;
            res.status(401);
            res.json(err);
        }

        const currentSpot = await Spot.findByPk(req.params.spotId)

        if (!currentSpot) {
            const err = Error();
            err.message = "Spot couldn't be found";
            err.statusCode = 404;
            res.status(404);
            res.json(err);
        }

        if (user.id !== currentSpot.ownerId) {
            const err = new Error();
            err.message = "Forbidden";
            err.statusCode = 403;
            res.status(403);
            res.json(err);
        }

        await currentSpot.destroy();

        res.json({
            message: "Successfully deleted",
            statusCode: 200
        })
    }
)

module.exports = router;
