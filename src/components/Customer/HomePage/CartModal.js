import React from 'react';
import Modal from 'react-modal';
import './CatModal.css';   

Modal.setAppElement('#root');

const CartModal = ({ isOpen, onRequestClose, carts, selectCart }) => {
    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Select Cart">
            <h2>Select a Cart</h2>
            {carts.length === 0 ? (
                <p>No carts available.</p>
            ) : (
                carts.map(cart => (
                    <div key={cart.cartId} className="cart-option">
                        <p>{cart.cartName}Hello</p>
                        <button onClick={() => selectCart(cart.cartId)}>Select</button>
                    </div>
                ))
            )}
            <button onClick={onRequestClose}>Close</button>
        </Modal>
    );
};

export default CartModal;
