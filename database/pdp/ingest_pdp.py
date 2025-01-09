import csv, contextlib
from ingest_common import TableHelper, connection

class RelationWriter:
  def __init__(self, writer: csv.DictWriter):
    super().__init__()
    self.writer = writer
    self.predicates = set()
  def writerow(self, rowdict):
    self.predicates.add(rowdict['predicate'])
    return self.writer.writerow(rowdict)
  def writerows(self, rowdicts):
    self.predicates.update([rowdict['predicate'] for rowdict in rowdicts])
    return self.writer.writerows(rowdicts)

class RelationHelper:
  def __init__(self):
    self.helper = TableHelper('pdp.relationship', ('source_type', 'source_id', 'predicate', 'target_type', 'target_id'), pk_columns=('predicate', 'source_id', 'target_id'))
  @contextlib.contextmanager
  def writer(self):
    with self.helper.writer() as relation:
      relation_wrapper = RelationWriter(relation)
      yield relation_wrapper
      print('got predicates', relation_wrapper.predicates)
      for predicate in relation_wrapper.predicates:
        try:
          with connection.cursor() as cur:
            cur.execute(f"""create table "pdp"."relationship__{predicate}" partition of "pdp"."relationship" for values in ('{predicate}');""")
        except:
          connection.rollback()
        else:
          connection.commit()

class NodeWriter:
  def __init__(self, writer: csv.DictWriter):
    super().__init__()
    self.writer = writer
    self.types = set()
  def writerow(self, rowdict):
    self.types.add(rowdict['type'])
    return self.writer.writerow(rowdict)
  def writerows(self, rowdicts):
    self.types.update([rowdict['type'] for rowdict in rowdicts])
    return self.writer.writerows(rowdicts)

class NodeHelper:
  def __init__(self):
    self.helper = TableHelper('pdp.entity', ('type', 'id', 'attributes', 'pagerank',), pk_columns=('type', 'id',), add_columns=('pagerank',))
  @contextlib.contextmanager
  def writer(self):
    with self.helper.writer() as node:
      node_wrapper = NodeWriter(node)
      yield node_wrapper
      print('got types', node_wrapper.types)
      for node_type in node_wrapper.types:
        try:
          with connection.cursor() as cur:
            cur.execute(f"""create table "pdp"."entity__{node_type}" partition of "pdp"."entity" for values in ('{node_type}');""")
        except:
          connection.rollback()
        else:
          connection.commit()
