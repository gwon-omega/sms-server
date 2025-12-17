


// collect all slices and store 

import { configureStore } from "@reduxjs/toolkit";
import authSlice from './auth/auth-slice'

const store = configureStore({
    reducer : {
        auth : authSlice
    }
})


export default store 

// dispatch ko type --> paxi kaam lagxa hamilai 
// dispatch(setName()) --> dispatch() : AppDispatch
export type AppDispatch =  typeof store.dispatch // useDispatch lai type dina chayenxa 
export type RootState = ReturnType<typeof store.getState> // useSelector lai type dina chayenxa

// react-redux -- package 
// next - reduxToolkit 

// differents hook provide garxa :useSelector (), useDispatch()
