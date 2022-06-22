import { v4 } from 'uuid';

/**
 * @param {Object} box - the application sandbox
 */
export default function(box) {
  const events = box.get('events');
  const outbox = [];
  let jainkyModuleDown = false;

  box.put('slideshow', { create });

  events.on('slideshow.downloaded', onSlideshowDownloaded);
  events.on('application.info.moduleStopped', onModuleStopped);
  events.on('application.info.moduleRestarted', onModuleRestarted);

  /**
   * 
   */
  function create() {
    const uuid = v4();

    if (jainkyModuleDown) {
      outbox.push(uuid);
      console.log(outbox);
      return {
        url: null,
        status: 'pending',
        uuid,
      }
    }

    return {
      url: `/slideshows/${uuid}`,
      status: 'complete'
    }
  }

   /**
   * 
   */
  function onModuleRestarted(appEvent) {  
    const moduleName = appEvent.payload();
    if (moduleName === '/lib/jainky-module') {
      jainkyModuleDown = false;
      
      for (let item of outbox) {
        console.log(item);
      }
    }
  }

  /**
   * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
   */
  function onModuleStopped(appEvent) {  
    const moduleName = appEvent.payload();
    if (moduleName === '/lib/jainky-module') {
      jainkyModuleDown = true;
    }
  }

  /**
   * @param {AppEvent} appEvent
   */
  function onSlideshowDownloaded(appEvent) {
    console.log(appEvent.payload());
  }
}