ConnecTag
=============

Copyright 2010 iCrossing, Inc
ConnecTag is released under the LGPL license, see COPYING and COPYING.LESSER for full details.

Overview
--------

ConnecTag is an open source software project dedicated to creating a fully customer-deployable tracking tag container solution, enabling simplified management and trivial enabling/disabling of multiple tracking tags. ConnecTag was developed to overcome some of the current challenges associated with pixeling web sites:

- The frequent need to add and/or remove tags from a page, pages, or an entire site
- A method for sharing a unique key across multiple tracking solutions (i.e. attribution)
- Reliance on hosted third-party container services
- Empowering the department responsible for the management, performance, and security of your web site (typically IT, but could be your overworked webmaster, too)

Elevator Pitch
--------------

ConnecTag is a container tag solution that replaces the "tag soup" you might currently have strewn across the pages of your web site with a single, standardized JavaScript tag. It's a self-hosted, client-side container tag that supports management of analytics tags through a centralized configuration file. It is designed to put the control of your tracking solutions back in the hands of the people responsible for the management, performance, and security of your web site.

How it Works
------------

ConnecTag abstracts tagging implementations through an intermediate JavaScript object (ConnecTag), a JSON configuration file, and vendor plugins. Abstraction of tagging implementations allows site administrators to switch, add, or remove analytics solutions with little to no modification of site pages.

The JSON configuration file contains the information needed for ConnecTag to implement a tag on the page. This information includes static values, placeholders for dynamic values, and tag inclusion/exclusion flags for global, event, and page-level tag configurations.

A plugin is a vendor-specific JavaScript object that knows how to write its tag to the page when given configuration details. The plugin provides wrapper methods that call native methods of the vendor object. Each plugin is exclusive to one vendor and functions independently of any others.

What's in the Box?
------------------

ConnecTag comes with everything you need to get started:

   - The ConnecTag container tag
   - Three vendor plugins:
      - iCrossing's Interest2Action
      - Google Analytics\*
      - Omniture\*

\*Note: Any trademarks or copyrights are the property of their respective owners

Getting Started
---------------

- Read the wiki
- Create your configuration file
- Put ConnecTag on the pages you'd like to track

A basic on-page implementation of ConnecTag might look like this:

_Place ConnecTag just before the close of the body tag._

      <script type="text/javascript" src="/path/to/your/connectag.js"></script>
      <script type="text/javascript">
            ConnecTag.connect({ json: "/path/to/your/configuration.json" });
      </script>

The code snippet above will load ConnecTag and your ConnecTag configuration file. Then ConnecTag will inject and execute the vendor tags according to the rules specified in your configuration.

Really Getting Started
----------------------

To get more details on setting up ConnecTag take a look at the documentation in the wiki.

What It Doesn't Do
------------------

- ConnecTag is not a hosted service. ConnecTag must be incorporated into and hosted on your web site
- ConnecTag is not, by itself, a tracking or analytics solution. It is only a container tag that enables you to manage the services of other providers
- ConnecTag is open source software and there are no guarantees; use at your own risk

Any Drawbacks?
--------------

Since ConnecTag handles the loading of vendor pixels there is a slight addition to the load time. That said, we believe that the control over specifically which tags get fired and the ability to tweak the source code for the container tag itself, may result in faster page load times. All loading initiated by ConnecTag is asynchronous.

License
-------

ConnecTag is released under the LGPL license, see COPYING and COPYING.LESSER for full details, but essentially, this means:

- You can use, modify and distribute ConnecTag, but do so in the spirit of open source
- You must leave the copyright notices intact
- You must share any modifications you make to ConnecTag's source
- You don't have to share the source for software ConnecTag is incorporated into
- Give credit where due, spread the word, and link, link, link!

Contributing
------------

We encourage you to download, modify, and contribute back to ConnecTag\! What do we need your help with?

- Adding new vendor plugins
- Adding additional matchers that have may a common use case
- Optimizing the helper functions
- Optimizing/improving existing vendor plugins
