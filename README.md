# Sandbox Pattern

## Purpose 
To implement a design of application sandboxes in order to learn where this pattern may be useful as well as what the limitations of this pattern may be and how to migitate them.

## Local Development

1. Do `npm start` to launch the application


## Table of Contents

* [Overview](#overview)
* [Objective(s)](#objectives)
* [Architectural Notes](#architectural-notes)
* [References](#references)


## Overview <a name="overview"></a>
A first attempt at *an* implementation of Nicholas Zaka's Sandbox Pattern described in this [talk](https://www.youtube.com/watch?v=mKouqShWI4o). Slide deck available [here](https://www.slideshare.net/nzakas/scalable-javascript-application-architecture). 

The key insight from this talk is that large application archictectures can embrace pluggable modules and communication via events in order to remain stable and extensible as conditions and requirements change.

Architectures that include components with too many direct connections among themselves results in tight coupling. Any change to any part of the architecture may have an unknown and unpredictable number of impacts as a result of these long chains of dependencies.

Events allow decoupling application modules from one another.

Another key reference for this specific attempt comes directly from Stoyan Stefanov's *Javascript Design Patterns*. The Sandbox Pattern featured in this book is the direct inspiration for this version of the implementation of application sandboxes. 

## Objective(s) <a name="objectives"></a>
Create an app that has the following key features:

| **Feature**                                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  Should be able to CRUD some basic resource(s)                                                                                                                      |
|  Should be composed of modules that have no knowledge of the larger application or its objectives                                                                    |
|  Should house modules that communicate with other modules or the core application either by emitted events or by exposing a limited API to consume |
|  Should be able to stop and restart modules that are experiencing errors                                                                                            |
|  Should be able to recover/resume in-progress work on restarting a problem module                                                                                   |
|  Should be able to continue operating if a module is stopped indefinitely                                                                                           |
|  Should be able to inspect module metadata                                                                                                                          |
|  Should be able to expose an HTTP API for accessing CRUD-able resources                                                                                              |
|  Should be able to receive command messages to change application state via API                                                                                     |
|  Should be able to add plugins that enhance functionality provided by existing modules                                                                              |

## Architectural Notes <a name="architectural-notes"></a>

#### Diagram of Key Application Components
![architectural diagram](/docs/sandbox-pattern-v0.0.1.png?raw=true)

### Key Entities

#### `Application` (Application Core)
The core of our program. This is the only component of the system that knows the entirety of business objectives. This component can start and stop client-defined Modules ([see below](#modules)), catch and respond to errors propagated from those modules, as well as listen and respond to events emitted from modules. 

This component can also call any API methods client-defined modules choose to expose to the application core. In the example below the `sandbox` parameter consumed by the callback function is where our client-defined modules expose functionality for the sandboxed application core to use. Our application core *only* has access to the APIs defined on `sandbox` and its own functions.

Application Core Example:

```
Sandbox(['foo-module'], async function(sandbox) {
  // Welcome to the application core.
  // This is where all the magic happens (most of it anyway).
  // Do consquential things here.
  const events = sandbox.get('events');
  const sbFetch = sandbox.get('ajax');
  const kats = await sbFetch('https://kitty.service/api/v1/kats');

  sandbox.my.jainkyModule.hello();

  events.notify('meow', kats);
});
```

#### `ApplicationSandboxWrapper`
An important associate of the application core, this entity produces the `sandbox` parameter consumed by the application core in the example above. 

This `sandbox` is an immutable object revealing an API that consists of key methods for accessing the network, event handling and error propagation. This API also provides methods client-defined modules may use to expose their APIs to the application core. 

The methods on `sandbox` are available to all *client-defined* modules in addition to the application core. They are *guaranteed* to be present. 

Under the hood the `ApplicationSandboxWrapper` takes the `SandboxController` interface [see below](#sandbox-controller) and all registered client-defined module APIs to produce a new immutable API consumed *only* by the application core.

An overview of the key methods and namespaces available on this object are listed below.

---

##### `ajax`
Contains a method for making network requests. This method wraps the `node-fetch` package with a similar API.

##### `events`
Contains methods for registering and broadcasting events; wraps the NodeJs `EventEmitter` API.

##### `errors`
Contains a method for creating structured error messages.

##### `database`
Contains methods for accessing a datastore. 

---
##### `get()`
This methods returns any of the above default sandbox APIs by name.

##### `moduleCtrl`
Contains a map of all registered client-defined modules and the methods required to stop as well as restart the modules, aptly named: `start` and `stop`.

##### `my`
The namespace under which all registered client-defined module APIs are housed; the application core can access any registered module API method as follows: `sandbox.my.jainkModule.hello()`. This namespace is *only* available to the application core.

##### `plugin()`
This method creates a plugin on a default sandbox API or a client-defined module.

##### `put()`
This method registers a client-defined module's API for use by the application core.

---

#### `Module` <a name="modules"></a>
A distinct piece of library code the application core consumes to do specialized tasks.

Client-Defined Module Example:

```
export default function jainkyModule(sandbox) {
  sandbox.put('jainkyModule', { hello });
  sandbox.my 
  // No bueno. The `sandbox.my` namespace is not undefined on client-defined modules

  console.log('jainkyModule is [UP]');

  const timeout = setTimeout(()=> {
    sandbox.events.notify('application.error', {
      id: 'module.jainky',
      message: 'This is a jainky module, lol',
      name: 'LibJainkyModuleError', 
      module: '/lib/jainky-module',
    });
  }, 10000);

  function hello() {
    console.log('jainkyModule is [UP]')
  }

  function stop() {
    console.log('stopping jainkyModule...');
    clearInterval(timeout);
    console.log('jainkyModule is [DOWN]');
  }

  return stop;
}
```

Above we create a client-defined `jainkyModule` that consumes an instance of the `SandboxController` interface, i.e. the `sandbox` parameter in this example. We register a single public method on the `jainkyModule` API using `sandbox.put`. The `hello` method is accessed in the application core as follows: `sandbox.my.jainkyModule.hello()`.

> Note: even though the name `sandbox` is used in both the module example and the application core example above, these **are not the same object**. Attempting to access the `sandbox.my` namespace or any of its sub-properties in the *client-defined module* example immediately above would throw an error, as would attempting to access the `sandbox.moduleCtrl` namespace.

Client-defined modules can *only* access the methods on the `SandboxController` interface. They can only register their public APIs for exposure to the application core. 

If a client-defined module wishes to communicate with peer modules *or* with the application core it **must** do so using events. To extend the example above to include sending an event to the application core or interested modules, observe:

```
const events = sandbox.get('events');
events.notify('event.of.interest', { data });
```

Finally, a client-defined module *may* return an optional function to stop itself (seen above) that can tear down any resources when the application core attempts to shut down the module.

#### `SandboxController (Proxy)` <a name="sandbox-controller"></a>
Also referred to as 'default sandbox APIs.' This component is consumed by each of the registered client-defined modules as shown in the module example above. The `SandboxController` *does not* contain methods and properties namespaced beneath the `sandbox.my` and `sandbox.moduleCtrl` properties. These properties are *only* available to the application core. 

#### `Sandbox`

Exposes methods for creating client-defined modules and creating new sandboxed applications.

##### `of()`
The constructor for creating a new sandboxed application core. Creates a sandbox for the application core to 'play' in. This application core only has access to:
  1. its own functions 
  2. the default sandbox APIs
  3. those methods exposed on public APIs of registered client-defined modules (accessible on the `sandbox.my` namespace)

```
Sandbox(['bar-module', 'qux-module'], async function(sandbox) {
  // In the first argument we list modules we want to include on the `sandbox`. 
  // These client-defined modules *may* return a public API for us 
  // to consume here via `sandbox.my`.
  // They may also just produce side-effects we are interested in.
});
```

##### `module()`
The constructor for creating a new client-defined module.

> See this architecture's key entities and relationships rendered on a UML diagram [here](https://sketchboard.me/BCVxkLfhaFq).


#### Plugins

Client-defined modules that can extend default sandbox APIs or other client-defined modules.

```
export default function pluginEventAuthz(sandbox) {
  sandbox.plugin({
    extendsDefault: true,
    fn: myPlugin,
    name: '/plugins/events-authz',
    of: 'events',
  });
  
  function myPlugin(events) {
    const hotNewAPI = {
      newHotness() {
        // incorporate events somehow
      }
    }

    return hotNewAPI;
  }
}
```

Above we extend the events API on the default sandbox by defining a function that takes the events API as argument (`myPlugin` in the example). 

`myPlugin` returns a shiny and presumably new and improved API for events. 

In the call to `box.plugin` we specify that we are creating a plugin for a default sandbox API with `extendsDefault`; we indicate the default API being extended with `of` and name the plugin with the `name` parameter. 

> Note: plugins *must* be prefixed with `/plugins/`, without this prefix the framework will not be able to locate the plugin.

Plugins are applied differently depending on whether they extend default sandbox APIs or client-defined modules. 

##### Plugins for Client-Defined Modules
Plugins that extend client-defined modules are accessible only to the application core under the `sandbox.my.plugins` namespace, with the key set to the value of the `name` parameter in the call to the `box.plugin` method.

```
Sandbox(['jainky-module'], async function(sandbox) {
  const jainkyModule = sandbox.my.jainkyModule;
  const superJainkyModule = sandbox.my.plugins['/plugins/super-jainky-module'].load(jainkyModule);
});
```

When a client-defined module is extended with a plugin (i.e. `jainky-module` above), the application core decides whether or not it will apply the plugin for a specified module. Above, the 'jainky-module' is consumed by the plugin 'super-jainky-module' to produce an upgraded API.

##### Plugins for Default Sandbox APIs
With plugins for default sandbox APIs the opposite is true: client-defined modules must *opt-in* to use upgraded APIs. To consume the `events-authz` plugin for the default `events` API above inside a client-defined module, we would do:

```
const events = sandbox.get('/plugins/events-authz');
```

We call the plugin by its specifed name and the API is immediately available for use inside *client-defined* modules.

> Note: We could access the original 'unplugged' events API with `sandbox.get('events')`. Plugins only augment; they do not alter the code they plug into.  


## References <a name="references"></a>

* *JavaScript Design Patterns* by Stoyan Stefanov
* [Box Tech Talk: Scalable JavaScript Application Architecture by Nicholas Zakas](https://www.youtube.com/watch?v=mKouqShWI4o)
* Patterns For Large-Scale JavaScript Application Architectures by Addy Osmani
* [Addy Osmani - Scaling Your JavaScript Applications Part 1](https://www.youtube.com/watch?v=2g8AceFb0is)
* [Addy Osmani - Scaling Your JavaScript Applications Part 3](https://www.youtube.com/watch?v=LZK-ObWu_5I)
* *Enterprise Integration Patterns* by Gregor Hohpe and Bobby Woolf


