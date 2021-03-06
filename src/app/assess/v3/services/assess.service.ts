
import { Injectable } from '@angular/core';
import { empty as observableEmpty, forkJoin as observableForkJoin, Observable, zip as observableZip } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AssessmentObject } from 'stix/assess/v2/assessment-object';
import { RiskByAttack } from 'stix/assess/v2/risk-by-attack';
import { RiskByKillChain } from 'stix/assess/v3/risk-by-kill-chain';
import { SummaryAggregation } from 'stix/assess/v2/summary-aggregation';
import { Assessment } from 'stix/assess/v3/assessment';
import { JsonApiData } from 'stix/json/jsonapi-data';
import { GenericApi } from '../../../core/services/genericapi.service';
import { RxjsHelpers } from '../../../global/static/rxjs-helpers';
import { Constance } from '../../../utils/constance';
import { LastModifiedAssessment } from '../models/last-modified-assessment';

@Injectable({
    providedIn: 'root'
  })
export class AssessService {
    public readonly assessBaseUrl = Constance.X_UNFETTER_ASSESSMENT_URL;
    public readonly relationshipsBaseUrl = Constance.RELATIONSHIPS_URL;

    constructor(
        private genericApi: GenericApi,
    ) { }

    /**
     * @description call generic api GET request, with given route
     * @param route
     */
    public genericGet(route = '') {
        if (!route) {
            return observableEmpty();
        }
        return this.genericApi.get(route);
    }

    /**
     * @description
     * @param {string} url
     * @return {Observable<T>}
     */
    public getAs<T>(url = ''): Observable<T | T[]> {
        if (!url) {
            return observableEmpty();
        }

        return this.genericApi.getAs<JsonApiData<T>>(url)
            .pipe(
                map<any, T | T[]>(RxjsHelpers.mapAttributes)
            );
    }

    /**
     * @description call generic api POST request with given route and data
     * @param route
     * @param data 
     */
    public genericPost(route: string, data: any) {
        if (!route) {
            return observableEmpty();
        }

        return this.genericApi.post(route, { 'data': { 'attributes': data } });
    }

    /**
     * @description call generic api PATCH request, with given route and data
     * @param route
     * @param data 
     */
    public genericPatch(route: string, data: any) {
        if (!route) {
            return observableEmpty();
        }

        return this.genericApi.patch(route, { 'data': { 'attributes': data } });
    }

    /**
     * @description call generic api DELETE request, with given item and id
     * @param item
     * @return {Observable}
     */
    public delete(item?: any): Observable<any> {
        if (!item) {
            return observableEmpty();
        }

        const url = this.assessBaseUrl + '/' + item.id;
        return this.genericApi.delete(url);
    }

    /**
     * @description load an assessment w/ optional filter
     * @param {string} filter
     * @return {Observable<Assessment[]>}
     */
    public load(filter?: string): Observable<Assessment[]> {
        const url = filter ?
            `${this.assessBaseUrl}?${encodeURI(filter)}` : this.assessBaseUrl;
        return this.genericApi.get(url);
    }

    /**
         * @description
         * @param {string} id
         * @return {Observable<Assessment> }
         */
    public getById(id: string, includeMeta = true): Observable<Assessment> {
        const url = `${this.assessBaseUrl}/${id}?metaproperties=${includeMeta}`;
        return this.genericApi
            .getAs<JsonApiData<Assessment>>(url)
            .pipe(
                // remove the attributes wrapping
                map<any, Assessment>(RxjsHelpers.mapAttributes),
                // cast the object literal to an actual object so we have its methods
                map((assessment: Assessment) => new Assessment(assessment))
            );
    }

    /**
     * @description return multiple assessment type associated with given rollup id
     * @param {string} id
     * @param {boolean} includeMeta
     * @return {Observable<Assessment[]>}
     */
    public getByRollupId(id: string, includeMeta = true): Observable<Assessment[]> {
        const filter = {
            'metaProperties.rollupId': id
        };
        const url = `${this.assessBaseUrl}?metaproperties=${includeMeta}&filter=${encodeURI(JSON.stringify(filter))}`;
        return this.genericApi
            .getAs<JsonApiData<Assessment>[]>(url)
            .pipe(
                // remove the attributes wrapping
                map<any[], Assessment[]>(RxjsHelpers.mapAttributes),
                // cast the object literal to an actual object so we have its methods
                map((arr: Assessment[]) => arr.map((_) => new Assessment(_)))
            );
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable<any>}
     */
    public deleteByRollupId(id: string): Observable<any> {
        if (!id || id.trim().length === 0) {
            return observableEmpty();
        }
        const url = `${this.assessBaseUrl}`;
        const loadAll$ = this.getByRollupId(id);
        const deleteAssociated$ = (assessments: Assessment[]) => {
            console.log(assessments);
            // with associated assessment types
            const calls = assessments
                .map((assessment) => {
                    const deleteUrl = `${url}/${assessment.id}`;
                    return this.genericApi.delete(deleteUrl);
                });
            return observableForkJoin(...calls);
        };

        return observableZip(loadAll$, deleteAssociated$)
            .pipe(
                mergeMap((val) => val)
            );
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable}
     */
    public getRiskPerKillChain(id: string): Observable<any> {
        if (!id) {
            return observableEmpty();
        }

        const url = `${this.assessBaseUrl}/${id}/risk-per-kill-chain`;
        return this.genericApi.getAs<RiskByKillChain>(url);
    }

    /**
 * @description
 * @param {string} id
 * @return {Observable}
 */
    public getRiskPerKillChainByRollupId(id: string): Observable<any> {
        if (!id) {
            return observableEmpty();
        }

        const url = `${this.assessBaseUrl}/${id}/risk-per-kill-chain`;
        return this.genericApi.get(url);
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable<RiskByAttack>}
     */
    public getRiskPerAttackPattern(id: string, includeMeta = true, isCapability = false): Observable<RiskByAttack> {
        if (!id) {
            return observableEmpty();
        }
        const url = `${this.assessBaseUrl}/${id}/risk-by-attack-pattern?metaproperties=${includeMeta}&isCapability=${isCapability}`;
        return this.genericApi.getAs<RiskByAttack>(url);
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable}
     */
    public getRiskPerAttackPatternByRollupId(id: string, includeMeta = true): Observable<RiskByAttack[]> {
        if (!id) {
            return observableEmpty();
        }
        const filter = {
            'metaProperties.rollupId': id
        };

        const url = `${this.assessBaseUrl}/${id}/risk-by-attack-pattern?metaproperties=${includeMeta}&filter=${encodeURI(JSON.stringify(filter))}`;
        return this.genericApi
            .getAs<JsonApiData<RiskByAttack>[]>(url)
            .pipe(
                // remove the attributes wrapping
                map<any[], RiskByAttack[]>(RxjsHelpers.mapAttributes),
                // cast the object literal to an actual object so we have its methods
                map((arr: RiskByAttack[]) => arr.map((_) => Object.assign(new RiskByAttack(), _)))
            );
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable}
     */
    public getSummaryAggregation(id: string, isCapability: boolean = false): Observable<SummaryAggregation> {
        if (!id) {
            return observableEmpty();
        }

        const url = `${this.assessBaseUrl}/${id}/summary-aggregations?isCapability=${isCapability}`;
        return this.genericApi.getAs<SummaryAggregation>(url);
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable}
     */
    public getSummaryAggregationByRollup(id: string, includeMeta = true): Observable<SummaryAggregation[]> {
        if (!id) {
            return observableEmpty();
        }
        const filter = {
            'metaProperties.rollupId': id
        };

        const url = `${this.assessBaseUrl}/${id}/summary-aggregations?metaproperties=${includeMeta}&filter=${encodeURI(JSON.stringify(filter))}`;
        return this.genericApi
            .getAs<JsonApiData<SummaryAggregation>[]>(url)
            .pipe(
                map<any[], SummaryAggregation[]>(RxjsHelpers.mapAttributes)
            );
    }


    /**
     * @deprecated - operating on the creator id has been replaced by the new security filter, this method will be removed
     * @description retrieve full assessments for given creator
     * @param {string} creatorId, creator mongo user id, not stix identity
     * @return {Observable<Assessment[]>}
     */
    public getAssessmentsByCreatorId(creatorId: string, includeMeta = true): Observable<Assessment[]> {
        const filter = {
            'creator': creatorId,
        };
        const url = `${this.assessBaseUrl}?metaproperties=${includeMeta}&filter=${encodeURI(JSON.stringify(filter))}`;
        return this.genericApi
            .getAs<JsonApiData<Assessment>[]>(url)
            .pipe(
                map<any[], Assessment[]>(RxjsHelpers.mapAttributes)
            );
    }

    /**
     * @description retrieve <i>partial assessments</i>, for all creators/users in system
     *  NOTE: the backend may apply security filters, based on user and run mode
     * @return {Observable<Partial<LastModifiedAssessment>[]>}
     */
    public getLatestAssessments(): Observable<Partial<LastModifiedAssessment>[]> {
        const url = `${this.assessBaseUrl}/latest`;
        return this.genericApi.getAs<Partial<LastModifiedAssessment>[]>(url);
    }

    /**
     * @deprecated - operating on the creator id has been replaced by the new security filter, this method will be removed
     * @description retrieve <i>partial assessments</i> for given creator
     *   NOTE: the backend may apply security filters, based on user and run mode
     * @param {string} userId, creator mongo user id, not stix identity
     * @return {Observable<Partial<LastModifiedAssessment>[]>}
     */
    public getLatestAssessmentsByCreatorId(creatorId: string, includeMeta = true): Observable<Partial<LastModifiedAssessment>[]> {
        const url = `${this.assessBaseUrl}/latest/${creatorId}`;
        return this.genericApi.getAs<Partial<LastModifiedAssessment>[]>(url);
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable<any>}
     */
    public getAssessedObjects(id: string): Observable<AssessmentObject[]> {
        if (!id) {
            return observableEmpty();
        }

        return this.genericApi.getAs<AssessmentObject[]>(`${this.assessBaseUrl}/${id}/assessed-objects`);
    }

    /**
     * @description
     * @param {string} id
     * @return {Observable<any>}
     */
    public getAttackPatternRelationships(id: string): Observable<any> {
        if (!id) {
            return observableEmpty();
        }

        let query = { 'stix.target_ref': id, 'stix.relationship_type': { $in: ['mitigates', 'indicates'] } };
        return this.genericApi.get(`${this.relationshipsBaseUrl}?filter=${encodeURI(JSON.stringify(query))}`);
    }


}
