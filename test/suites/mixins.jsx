/**
 * Baobab-React Mixin Test Suite
 * ==============================
 *
 */
var assert = require('assert'),
    React = require('react'),
    Baobab = require('baobab'),
    mixins = require('../../src/mixins.js');

// Components
var DummyRoot = React.createClass({
  mixins: [mixins.root],
  render: function() {
    return <div />;
  }
});

var Root = React.createClass({
  mixins: [mixins.root],
  render: function() {
    var Component = this.props.component;

    return <Component arg={this.props.arg || null} />;
  }
});

describe('Mixin', function() {

  it('should fail if passing a wrong tree to the root mixin.', function() {

    assert.throws(function() {
      React.render(<DummyRoot tree={{hello: 'world'}} />, document.mount);
    }, /Baobab/);
  });

  it('the tree should be propagated through context.', function() {
    var tree = new Baobab({name: 'John'}, {asynchronous: false});

    var Child = React.createClass({
      mixins: [mixins.branch],
      render: function() {
        return <span id="test">Hello {this.context.tree.get('name')}</span>;
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello John');
  });

  it('the should be propagated to nested components.', function() {
    var tree = new Baobab({name: 'John'}, {asynchronous: false});

    var UpperChild = React.createClass({
      render: function() {
        return <Child />;
      }
    });

    var Child = React.createClass({
      mixins: [mixins.branch],
      render: function() {
        return <span id="test">Hello {this.context.tree.get('name')}</span>;
      }
    });

    React.render(<Root tree={tree} component={UpperChild} />, document.mount);

    assert.selectorText('#test', 'Hello John');
  });

  it('should fail if the tree is not passed through context.', function() {
    var Child = React.createClass({
      mixins: [mixins.branch],
      render: function() {
        return <span id="test">Hello John</span>;
      }
    });

    assert.throws(function() {
      React.render(<Child />, document.mount);
    }, /Baobab/);
  });

  it('should be possible to bind several cursors to a component.', function() {
    var tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: {
        name: ['name'],
        surname: ['surname']
      },
      render: function() {

        return (
          <span id="test">
            Hello {this.state.name} {this.state.surname}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello John Talbot');
  });

  it('bound components should update along with the cursor.', function() {
    var tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: {
        name: ['name'],
        surname: ['surname']
      },
      render: function() {

        return (
          <span id="test">
            Hello {this.state.name} {this.state.surname}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello John Talbot');

    tree.set('surname', 'the Third');

    assert.selectorText('#test', 'Hello John the Third');
  });

  it('should be possible to set cursors with a function.', function() {
    var tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: function() {
        return {
          name: this.props.arg,
          surname: ['surname']
        };
      },
      render: function() {

        return (
          <span id="test">
            Hello {this.state.name} {this.state.surname}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} arg={['name']} />, document.mount);

    assert.selectorText('#test', 'Hello John Talbot');
  });

  it('should be possible to pass cursors directly.', function() {
    var tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false}),
        cursor = tree.select('name');

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: {
        name: cursor,
        surname: ['surname']
      },
      render: function() {

        return (
          <span id="test">
            Hello {this.state.name} {this.state.surname}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello John Talbot');
  });

  it('should be possible to use facets.', function() {
    var tree = new Baobab(
      {
        name: 'John',
        surname: 'Talbot'
      },
      {
        asynchronous: false,
        facets: {
          name: {
            cursors: {
              value: ['name']
            },
            get: function(data) {
              return data.value;
            }
          }
        }
      }
    );

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: {
        surname: ['surname']
      },
      facets: {
        name: 'name'
      },
      render: function() {

        return (
          <span id="test">
            Hello {this.state.name} {this.state.surname}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello John Talbot');
  });

  it('cursors should take precedence over facets.', function() {
    var tree = new Baobab(
      {
        name: 'Jack',
        surname: 'Talbot'
      },
      {
        asynchronous: false,
        facets: {
          name: {
            get: function(data) {
              return 'John'
            }
          }
        }
      }
    );

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: {
        name: ['name']
      },
      facets: {
        name: 'name'
      },
      render: function() {
        return (
          <span id="test">
            Hello {this.state.name}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello Jack');
  });

  it('should be possible to access the cursors within the component.', function() {
    var tree = new Baobab({name: 'John', surname: 'Talbot'}, {asynchronous: false});

    var Child = React.createClass({
      mixins: [mixins.branch],
      cursors: {
        name: ['name'],
        surname: ['surname']
      },
      render: function() {

        return (
          <span id="test">
            Hello {this.cursors.name.get()} {this.cursors.surname.get()}
          </span>
        );
      }
    });

    React.render(<Root tree={tree} component={Child} />, document.mount);

    assert.selectorText('#test', 'Hello John Talbot');
  });
});
