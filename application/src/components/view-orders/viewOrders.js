import React, { Component } from 'react';
import { Template } from '../../components';
import { SERVER_IP } from '../../private';
import { connect } from 'react-redux';
import './viewOrders.css';

const DELETE_ORDER_URL = `${SERVER_IP}/api/delete-order`
const EDIT_ORDER_URL = `${SERVER_IP}/api/edit-order`

const mapStateToProps = (state) => ({
    auth: state.auth,
})

class ViewOrders extends Component {
    state = {
        orders: [],
        toggled: false,
        order_item: "",
        quantity: "1"
    }

    componentDidMount() {
        fetch(`${SERVER_IP}/api/current-orders`)
            .then(response => response.json())
            .then(response => {
                if(response.success) {
                    this.setState({ orders: response.orders });
                } else {
                    console.log('Error getting orders');
                }
            });
    }

    menuQuantityChosen(event) {
        this.setState({ quantity: event.target.value });
    }

    menuItemChosen(event) {
        this.setState({ order_item: event.target.value });
    }
    
    editItem(event, itemId) {
        this.setState({ toggled: true });
    }

    saveItem(event, itemId) {
        event.preventDefault();

        fetch(EDIT_ORDER_URL, {
            method: 'POST',
            body: JSON.stringify({
                id: itemId,
                order_item: this.state.order_item,
                quantity: this.state.quantity,
                ordered_by: this.props.auth.email || 'Unknown!',
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            this.setState({ orders: res.orders });
        })
        .then(response => console.log("Success", JSON.stringify(response)))
        

        this.setState({ toggled: false });
        
    }

    deleteItem(event, itemId) {
        event.preventDefault();
        const currentItem = this.state.orders;

        fetch(DELETE_ORDER_URL, {
            method: 'POST',
            body: JSON.stringify({
                id: itemId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(this.setState({
            orders: currentItem.filter(item => item._id !== itemId),
        }))
        .then(res => res.json())
        .then(response => console.log("Success", JSON.stringify(response)))
        .catch(error => console.error(error));
    }

    render() {
        return (
            <Template>
                <div className="container-fluid">
                {this.state.toggled && <strong>Edit Your Order!</strong>}
                {this.state.orders.map(order => {
                    const createdDate = new Date(order.createdAt);
                    return (
                        <div className="row view-order-container" key={order._id}>
                            <div className="col-md-4 view-order-left-col p-3">
                                {!this.state.toggled && <h2>{order.order_item}</h2>}
                                {this.state.toggled &&
                                    <div>
                                    <select 
                                        value={this.state.order_item} 
                                        onChange={(event) => this.menuItemChosen(event)}
                                        className="form-select"
                                    >
                                        <option value="" defaultValue disabled hidden>Lunch menu</option>
                                        <option value="Soup of the Day">Soup of the Day</option>
                                        <option value="Linguini With White Wine Sauce">Linguini With White Wine Sauce</option>
                                        <option value="Eggplant and Mushroom Panini">Eggplant and Mushroom Panini</option>
                                        <option value="Chili Con Carne">Chili Con Carne</option>
                                    </select>
                                </div>
                                }
                                <p>Ordered by: {order.ordered_by || ''}</p>
                            </div>
                            <div className="col-md-4 d-flex view-order-middle-col">
                                <p>Order placed at {`${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}`}</p>
                                {!this.state.toggled && <p>Quantity: {order.quantity}</p>}
                                {this.state.toggled && 
                                <div>
                                    <label>Quantity:</label>
                                    <select className="form-select" value={this.state.quantity} onChange={(event) => this.menuQuantityChosen(event)}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                    </select>
                                </div>
                                }
                             </div>
                             
                             <div className="col-md-4 view-order-right-col">
                                {!this.state.toggled && <button onClick={() => this.editItem()} className="btn btn-success">Edit</button>}
                                {this.state.toggled && <button onClick={(event) => this.saveItem(event, order._id)} className="btn btn-success">Save</button>}
                                <button onClick={(event) => this.deleteItem(event, order._id)} className="btn btn-danger">Delete</button>
                             </div>
                        </div>
                    );
                })}
            </div>
            
                
            </Template>
        );
    }
}

export default connect(mapStateToProps, null)(ViewOrders);
