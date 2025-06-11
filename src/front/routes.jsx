// Import necessary components and functions from react-router-dom.

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Private } from "./pages/Private";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route 
            path="/" 
            element={<Layout />} 
            errorElement={<h1>Not found!</h1>}
        >
            {/* Index route (homepage) */}
            <Route index element={<Home />} />
            
            {/* Other nested routes */}
            <Route path="/single/:theId" element={<Single />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/private" element={<Private />} />
        </Route>
    )
);