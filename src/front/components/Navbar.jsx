import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};

// const logout = () => {
// sessionStorage.removeItem('token')};
// store.message = null;
// store.token = null;
// store.isLoginSuccesful - false;
//}

// the button of LOG OUT (blue - or green, once logged in, changes to red or pink to LOG OUT automatically in dispatch on Store to fetc)