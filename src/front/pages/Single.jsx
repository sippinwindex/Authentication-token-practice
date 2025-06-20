// src/front/pages/Single.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getInvoice, deleteInvoice } from './fetch';
import './private.css';

export const Single = () => {
  const { store } = useGlobalReducer();
  const { theId } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!store.token) {
      navigate("/login");
      return;
    }

    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const invoiceData = await getInvoice(store.token, theId);
        setInvoice(invoiceData);
        setError("");
      } catch (error) {
        setError(error.message);
        if (error.message.includes("401") || error.message.includes("422")) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [store.token, theId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(store.token, invoice.id);
        navigate("/private");
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="alert alert-danger text-center">
            <h4>Error</h4>
            <p>{error}</p>
            <Link to="/private" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="alert alert-warning text-center">
            <h4>Invoice Not Found</h4>
            <p>The invoice you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/private" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="glassmorphism-card">
          <div className="text-center mb-4">
            <h1 className="display-4 text-dark">Invoice Details</h1>
            <hr className="my-4" />
          </div>

          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="invoice-card">
                <div className="row">
                  <div className="col-md-6">
                    <h3 className="text-primary mb-3">Invoice Information</h3>
                    <div className="mb-3">
                      <strong>Invoice Number:</strong>
                      <p className="text-muted">{invoice.invoice_number}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Amount:</strong>
                      <p className="text-success fs-4">${parseFloat(invoice.invoice_amount).toFixed(2)}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Date:</strong>
                      <p className="text-muted">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h3 className="text-primary mb-3">Actions</h3>
                    <div className="d-grid gap-2">
                      <Link 
                        to={`/private`} 
                        className="btn btn-outline-primary"
                      >
                        Edit Invoice
                      </Link>
                      <button 
                        onClick={handleDelete}
                        className="btn btn-outline-danger"
                      >
                        Delete Invoice
                      </button>
                      <Link 
                        to="/private" 
                        className="btn btn-primary"
                      >
                        Back to Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional invoice details section */}
          <div className="row mt-4">
            <div className="col-md-8 mx-auto">
              <div className="invoice-card">
                <h4 className="text-primary mb-3">Invoice Summary</h4>
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Created:</strong></td>
                        <td>{invoice.created_at ? new Date(invoice.created_at).toLocaleString() : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Last Updated:</strong></td>
                        <td>{invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <span className="badge bg-success">Active</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Single.propTypes = {
  match: PropTypes.object
};