# Sandbox Pattern

## Purpose 
To implement a design of application sanxboxes in order to learn where this pattern may be useful as well as what the limitations of this pattern may be and how to migitate them.

## Local Development

1. Do `npm start` to launch the application


## Table of Contents

* [Overview](#overview)
* [Objective(s)](#objectives)
* [Architectural Notes](#architectural-notes)
* [References](#references)


## Overview <a name="overview"></a>
An first attempt at *an* implementation of Nicholas Zaka's Sandbox Pattern described in this [talk](https://www.youtube.com/watch?v=mKouqShWI4o). Slide deck available [here](https://www.slideshare.net/nzakas/scalable-javascript-application-architecture). 

The key insight from this talk is that large application archictectures can embrace pluggable modules and communication via events in order to remain stable and extensible as conditions and requirements change.

Architectures that include components with too many direct connections among themselves results in tight coupling. Any change to any part of the architecture may have an unknown and unpredictable number of impacts as a result of these long chains of dependencies.

Events allow decoupling application modules from one another.

Another key reference for this specific attempt comes directly from Stoyan Stefanov's *Javascript Design Patterns*. The Sandbox Pattern feature in this book is the direct inspiration for this version of the implementation of application sandboxes. 

## Objective(s) <a name="objectives"></a>
Create an app that has the following key features:

| **Feature**                                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  Should be able to CRUD some basic resource(s)                                                                                                                      |
|  Should be composed of modules that have no knowledge of the larger application or its objectives                                                                    |
|  Should house modules that communicate with other modules or the core application either by emitted events or by exposing a limited API for peer modules to consume |
|  Should be able to stop and restart modules that are experiencing errors                                                                                            |
|  Should be able to recover/resume in-progress work on restarting a problem module                                                                                   |
|  Should be able to continue operating if a module is stopped indefinitely                                                                                           |
|  Should be able to inspect module metadata                                                                                                                          |
|  Should be able to expose a HTTP API for accessing CRUD-able resources                                                                                              |
|  Should be able to receive command messages to change application state via API                                                                                     |
|  Should be able to add plugins that enhance functionality provided by existing modules                                                                              |

## Architectural Notes <a name="architectural-notes"></a>

### Key Entities

#### `Application`
The core of our program. This is the only component of the system that knows the entirety of what is supposed to occur. This component can start and stop Modules (see below), catch and respond to errors propagated from modules as well as listen and respond to events emitted from modules. 

This component can also call any API methods modules choose to expose on the application sandbox. In the example below the `sandbox` parameter consumed by the callback function is where any modules expose functionality for our sandboxed application to use. Our application core *only* has access to the sandboxed module APIs and its own methods.

```
Sandbox(['foo-module'], async function(sandbox) {
    // Welcome to the application core.
    // This is where all the magic happens (most of it anyway).
    // Do consquential things here like fetch data from the internets

    const kats = await sandbox.fetch('https://cool.data/api/v1/cats');
    console.log(kats);
});
```

#### `ApplicationSandboxWrapper`
An important associate of the application, this entity produces the `sandbox` parameter consumed by the application core in the example above. This `sandbox` is an immutable object revealing an API that consists of key utility methods for accessing the network, event handling and error propagation. This API also exposes methods modules use to expose their APIs to the application core. The methods on this API are available to all modules in addition to the application core. They are *guaranteed* to be available. 

The `ApplicationSandboxWrapper` takes the `SandboxController` interface (see below) and all registered module APIs to produce a new immutable API consumed *only* by the application core.

##### `ajax`
Contains method for making network requests. This method wraps the `node-fetch` package with a similar API.

##### `events`
Contains methods for registering and broadcasting events; wraps the  NodeJs `EventEmitter` object.

##### `errors`
Contains a method for creating structured error messages

##### `moduleCtrl`
Contains a map of all registered modules and the methods required to stop as well as restart the modules, aptly named: `start` and `stop`.

##### `my`
The namespace under which all module APIs are housed, the application core can access any registered module API method as follows: `sandbox.my.jainkModule.hello()`

##### `put()`
This method registers a module's API for use by the application core

#### `Module`
A distinct piece of library code that application core consumes to do specialized tasks.

```
export default function jainkyModule(sandbox) {
  sandbox.put('jainkyModule', { hello });

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

Above we create a `jainkyModule` that consumes an instance of the `SandboxController` interface, the `sandbox` parameter. We register a single public method on the `jainkyModule` API using `sandbox.put`. The `hello` method is accessed in the application core as follows: `sandbox.my.jainkyModule.hello()`.

> Note: even though the name `sandbox` is used in both the module example and the application core example above, these **are not the same object**. Attempting to access the `sandbox.my` namespace or any of its sub-properties in the *module* example above would throw an error, as would attempting to access the `sandbox.moduleCtrl` namespace.

Modules can *only* access the methods on the `SandboxController`. They can only register their public APIs for exposure to the application core.

A module *may* return an optional function (seen above) that can tear down any resources when the application core attempts to stop the module.

#### `SandboxController`
This component is cosumed by each of the registered modules as shown above. It has all the same methods as the `ApplicationSandboxWrapper` *with the exception* of all the methods namespaced beneath the `my` property and `moduleCtrl`. 

#### `Sandbox`
Creates a sandbox for the application core  to 'play' in. This application core only has access to its own methods and those methods exposed on public APIs of registered modules.

##### `of()`
The constructor for creating new application sandbox.

##### `module()`
The constructor for creating a new module.

> See this architecture's key entities and relationships rendered on a UML diagram [here](https://sketchboard.me/BCVxkLfhaFq).

## References <a name="references"></a>

* *JavaScript Design Patterns* by Stoyan Stefanov
* [Box Tech Talk: Scalable JavaScript Application Architecture by Nicholas Zakas](https://www.youtube.com/watch?v=mKouqShWI4o)
* Patterns For Large-Scale JavaScript Application Architectures by Addy Osmani
* [Addy Osmani - Scaling Your JavaScript Applications Part 1](https://www.youtube.com/watch?v=2g8AceFb0is)
* [Addy Osmani - Scaling Your JavaScript Applications Part 3](https://www.youtube.com/watch?v=LZK-ObWu_5I)
* *Enterprise Integration Patterns* by Gregor Hohpe and Bobby Woolf


