// frontend/src/store/reviews.js
import { csrfFetch } from './csrf';

const DETAILS_SPOT_REVIEWS = 'spots/DETAILS_SPOT_REVIEWS';
const CREATE_REVIEW = 'spots/CREATE_REVIEW'

export const getSpotReviews = spot => ({
    type: DETAILS_SPOT_REVIEWS,
    spot
});

export const createReview = review => ({
    type: CREATE_REVIEW,
    review
})

export const getReviewsSpot = (id) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${id}/reviews`);

    if (response.ok) {
        const spot = await response.json();
        dispatch(getSpotReviews(spot));
    }
}

export const writeReview = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${payload}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    console.log(response)
    const review = await response.json();
    dispatch(createReview(review));
}

const initialState = { spot: {} };

const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case DETAILS_SPOT_REVIEWS:
            return {
                ...state, spot: { ...action.spot }
            };
        case CREATE_REVIEW:
            return {
                ...state,
                spot: {
                    ...state.spot,
                    [action.spot.id]: action.review
                }
            };
        default:
            return state;
    }
}

export default reviewReducer;
