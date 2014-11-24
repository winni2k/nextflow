/*
 * Copyright (c) 2013-2014, Centre for Genomic Regulation (CRG).
 * Copyright (c) 2013-2014, Paolo Di Tommaso and the respective authors.
 *
 *   This file is part of 'Nextflow'.
 *
 *   Nextflow is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   Nextflow is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with Nextflow.  If not, see <http://www.gnu.org/licenses/>.
 */

package nextflow.splitter

import groovy.transform.CompileStatic

/**
 * A collector strategy that creates a chunks as {@link List} of objects
 *
 * @author Paolo Di Tommaso <paolo.ditommaso@gmail.com>
 */
@CompileStatic
class ObjectListCollector implements CollectorStrategy {

    private List holder = new LinkedList()

    @Override
    void add(Object record) {
        holder.add(record)
    }

    @Override
    def getValue() {
        new ArrayList(holder)
    }

    @Override
    boolean isEmpty() {
        return holder.isEmpty()
    }

    @Override
    void next() {
        holder.clear()
    }

}
