/**
 * Created by marcostagni on 08/08/16.
 */
class User extends React.Component {
    render() {
        return(
            <div className="panel panel-default">
                <div className="panel-heading" role="tab">
                    <h4 className="panel-title">
                        <a className="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href={this.props.href} aria-expanded="false" aria-controls={this.props.id}>
                            {this.props.name}
                        </a>
                    </h4>
                </div>
                <div id={this.props.id} className="panel-collapse collapse" role="tabpanel">
                    <div className="panel-body">
                        {this.props.content}
                    </div>
                </div>
            </div>
        );
    }
}

class UserList extends React.Component {
    constructor() {
        super();

        this.state = {
            users: []
        };
    }

    componentWillMount() {
        this._getUsers();
    }

    componentDidMount() {
        this._timer = setInterval(() => this._getUsers(), 5000);
    }

    componentWillUnmount() {
        clearInterval(this._timer);
    }

    _getUsers() {
        // performing ajax call to retrieve users
        jQuery.ajax({
            method: 'GET',
            url: 'http://localhost:9000',
            success: function(response){
                this.setState({users: response.data.users});
            }.bind(this)
        });
    }

    _mapUsers() {
        // mapping users
        const users = this.state.users;

        return users.map((user) => {
            console.log(user);
        })
    }

    render() {
        const userList = this._mapUsers();

        return(
            <div className="panel-group" id="userlist" role="tablist" aria-multiselectable="true">
                {userList}
            </div>
        );
    }
};

ReactDOM.render(
    <UserList />, document.getElementById('container')
);
