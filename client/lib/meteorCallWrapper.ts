import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { EJSON } from 'meteor/ejson';

import { APIClient } from '../../app/utils/client';

((): void => {
	if (!window.USE_REST_FOR_DDP_CALLS) {
		return;
	}
	Meteor.call = function _meteorCallOverREST(method: string, ...params: any): void {
		const endpoint = Tracker.nonreactive(() => (!Meteor.userId() ? 'method.callAnon' : 'method.call'));

		let callback = params.pop();
		if (typeof callback !== 'function') {
			params.push(callback);
			callback = (): void => {
				// empty
			};
		}

		const restParams = {
			method,
			params: params && EJSON.stringify(params),
		};

		// not using async to not change Meteor.call return type
		APIClient.v1.post(endpoint, restParams)
			.then(({ result }) => callback(null, EJSON.parse(result)))
			.catch((error) => callback(error));
	};
})();