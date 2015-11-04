import Engine from '../../src/Engine';
import EventListener from '../../src/Markers/EventListener';

describe('EventListener', ()=> {
  let engine, node, spy;

  beforeEach(()=> {
    spy = jasmine.createSpy('callback');
    node = document.createElement('ul');
    engine = new Engine(document.createElement('div'));
    engine.test = spy;
  });

  beforeEach(()=> {
    document.body.appendChild(node);
  });

  afterEach(()=> {
    document.body.removeChild(node);
  });

  it('call function on proper event', ()=> {
    EventListener(engine, node, 'click: @test');

    const event = document.createEvent('Event');
    event.initEvent('click', true, false);
    node.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
    expect(spy.calls.mostRecent().object).toEqual(engine);
  });
});
