// frontend/src/store/spots.js
import { csrfFetch } from './csrf';

const LOAD_SPOTS = 'spots/LOAD_SPOTS';
const DETAILS_SPOT = 'spots/DETAILS_SPOT';
const CREATE_SPOT = 'spots/CREATE_SPOT';
const CREATE_SPOT_IMAGE = 'spots/CREATE_SPOT_IMAGE';
const USERS_SPOTS = 'spots/USERS_SPOTS';
const DELETE_SPOT = 'spots/DELETE_SPOT';
const EDIT_SPOT = 'spots/EDIT_SPOT';

export const loadSpots = (spots) => {
    return {
        type: LOAD_SPOTS,
        spots,
    };
};

export const userSpots = (spots) => {
    return {
        type: USERS_SPOTS,
        spots
    }
}

export const getDetailsOfSpot = spot => ({
    type: DETAILS_SPOT,
    spot
});

export const CreateASpot = spot => ({
    type: CREATE_SPOT,
    spot
})

export const CreateSpotImage = images => ({
    type: CREATE_SPOT_IMAGE,
    images
})

export const editASpot = (id, updatedSpot) => ({
    type: EDIT_SPOT,
    payload: { id, updatedSpot }
})

export const DeleteASpot = spot => ({
    type: DELETE_SPOT,
    spot
})

export const getAllSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    const spots = await response.json();
    dispatch(loadSpots(spots));
}

export const getUserSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots/current');

    if (response.ok) {
        const spots = await response.json();
        dispatch(userSpots(spots));
        return spots;
    }
}

export const getOneSpot = (id) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${id}`);

    if (response.ok) {
        const spot = await response.json();
        dispatch(getDetailsOfSpot(spot));
    }
};

export const createSpot = (payload) => async (dispatch) => {
    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (response.ok) {
        const spot = await response.json();
        dispatch(CreateASpot(spot));
        const image = await csrfFetch(`/api/spots/${spot.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload.previewImage)
        })
        dispatch(CreateSpotImage(image))
    }
}


export const editSpot = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.vals)
    })

    const spot = response.json();
    dispatch(createSpot(spot));
    return spot
}

export const deleteSpot = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}`, {
        method: 'DELETE',
    })

    if (response.ok) {
        dispatch(DeleteASpot(id));
    }
}

const initialState = { allSpots: {}, singleSpot: { SpotImages: [] }, userSpots: {} };
const spotReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case LOAD_SPOTS:
            newState = { ...state, allSpots: { ...state.allSpots } };
            action.spots.Spots.forEach((spot) => newState.allSpots[spot.id] = spot);
            return newState;
        case DETAILS_SPOT:
            newState = { ...state, singleSpot: { ...state.singleSpot } };
            newState.singleSpot = action.spot;
            const images = [];
            action.spot.SpotImages.forEach((image) => (images[image.id] = image));
            newState.singleSpot.SpotImages = images;
            return newState;
        case USERS_SPOTS:
            newState = { ...state, userSpots: { ...state.userSpots } };
            action.spots.Spots.forEach((spot) => newState.userSpots[spot.id] = spot);
            return newState;
        case CREATE_SPOT:
            newState = { ...state };
            newState.singleSpot[action.spot.id] = action.spot;
            newState.allSpots[action.spot.id] = action.spot;
            newState.userSpots[action.spot.id] = action.spot;
            return newState;
        case EDIT_SPOT:
            return { ...state, [action.singleSpot.id]: action.updatedSpot };
        case DELETE_SPOT:
            newState = { ...state };
            delete newState.allSpots[action.spot];
            delete newState.userSpots[action.spot];
            delete newState.singleSpot;
            return newState;
        default:
            return state;
    }
}

function normalizeData(dataArr) {
    let newObj = {};
    dataArr.forEach(element => {
        newObj[element.id] = element;
    });

    return newObj;
}



export default spotReducer;
